// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Grove.sol";
import "./InheritanceModule.sol";

/**
 * @title VotingModule - Democratic Withdrawal System with Escrow
 * @notice Allows circle members to vote on withdrawal proposals
 * @dev Uses escrow system - circle owner deposits funds, members vote on releases
 * @dev Integrates with InheritanceModule for actual fund distribution
 */
contract VotingModule {
    Grove public grove;
    InheritanceModule public inheritanceModule;
    
    struct Proposal {
        uint256 id;
        uint256 circleId;
        address proposer;
        address recipient; // Who gets the funds when approved
        uint256 amount;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 createdAt;
        uint256 votingEnds;
        bool executed;
        bool passed;
        mapping(address => bool) hasVoted;
        mapping(address => bool) voteChoice; // true = for, false = against
    }
    
    // Voting configuration per circle
    struct VotingConfig {
        uint256 votingPeriod; // seconds
        uint256 quorumPercentage; // percentage of members needed to vote (1-100)
        uint256 approvalPercentage; // percentage needed to pass (51-100)
        bool enabled; // circle owner must enable voting
    }
    
    // Escrow balances per circle
    mapping(uint256 => uint256) public circleEscrowBalance;
    mapping(uint256 => VotingConfig) public circleVotingConfig;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => uint256[]) public circleProposals; // circleId => proposalId[]
    
    uint256 public nextProposalId = 1;
    
    // Default voting configuration
    uint256 public constant DEFAULT_VOTING_PERIOD = 2 days;
    uint256 public constant DEFAULT_QUORUM = 50; // 50% of members must vote
    uint256 public constant DEFAULT_APPROVAL = 60; // 60% must approve
    
    event VotingEnabled(uint256 indexed circleId, address indexed owner);
    event EscrowDeposited(uint256 indexed circleId, address indexed owner, uint256 amount);
    event EscrowWithdrawn(uint256 indexed circleId, address indexed owner, uint256 amount);
    event ProposalCreated(uint256 indexed proposalId, uint256 indexed circleId, address indexed proposer, address recipient, uint256 amount);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId, bool passed, uint256 amount);
    event WithdrawalExecuted(uint256 indexed proposalId, uint256 indexed circleId, uint256 amount, address recipient);
    
    modifier onlyCircleOwner(uint256 circleId) {
        (, address owner, ) = grove.circles(circleId);
        require(msg.sender == owner, "Not circle owner");
        _;
    }
    
    modifier onlyCircleMember(uint256 circleId) {
        require(grove.isMemberOf(circleId, msg.sender), "Not circle member");
        _;
    }
    
    constructor(address _grove, address _inheritanceModule) {
        grove = Grove(_grove);
        inheritanceModule = InheritanceModule(_inheritanceModule);
    }
    
    /**
     * @dev Circle owner enables voting and delegates withdrawal permission
     */
    function enableVotingWithDelegation(uint256 circleId) external onlyCircleOwner(circleId) {
        VotingConfig storage config = circleVotingConfig[circleId];
        config.enabled = true;
        config.votingPeriod = DEFAULT_VOTING_PERIOD;
        config.quorumPercentage = DEFAULT_QUORUM;
        config.approvalPercentage = DEFAULT_APPROVAL;
        
        emit VotingEnabled(circleId, msg.sender);
    }
    
    /**
     * @dev Configure voting parameters (circle owner only)
     */
    function configureVoting(
        uint256 circleId,
        uint256 votingPeriod,
        uint256 quorumPercentage,
        uint256 approvalPercentage
    ) external onlyCircleOwner(circleId) {
        require(quorumPercentage > 0 && quorumPercentage <= 100, "Invalid quorum");
        require(approvalPercentage > 50 && approvalPercentage <= 100, "Invalid approval");
        
        VotingConfig storage config = circleVotingConfig[circleId];
        config.votingPeriod = votingPeriod;
        config.quorumPercentage = quorumPercentage;
        config.approvalPercentage = approvalPercentage;
    }
    
    /**
     * @dev Any circle member can propose a withdrawal to a specific recipient
     */
    function proposeWithdrawal(
        uint256 circleId,
        address recipient,
        uint256 amount,
        string calldata description
    ) external onlyCircleMember(circleId) returns (uint256 proposalId) {
        VotingConfig storage config = circleVotingConfig[circleId];
        require(config.enabled, "Voting not enabled for this circle");
        require(amount > 0, "Amount must be positive");
        require(recipient != address(0), "Invalid recipient");
        
        // Check escrow has enough balance
        require(amount <= circleEscrowBalance[circleId], "Insufficient escrow balance");
        
        proposalId = nextProposalId++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.id = proposalId;
        proposal.circleId = circleId;
        proposal.proposer = msg.sender;
        proposal.recipient = recipient;
        proposal.amount = amount;
        proposal.description = description;
        proposal.createdAt = block.timestamp;
        proposal.votingEnds = block.timestamp + config.votingPeriod;
        
        circleProposals[circleId].push(proposalId);
        
        emit ProposalCreated(proposalId, circleId, msg.sender, recipient, amount);
        
        return proposalId;
    }
    
    /**
     * @dev Circle members vote on proposals
     */
    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp <= proposal.votingEnds, "Voting period ended");
        require(!proposal.executed, "Proposal already executed");
        require(grove.isMemberOf(proposal.circleId, msg.sender), "Not circle member");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.voteChoice[msg.sender] = support;
        
        if (support) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }
        
        emit VoteCast(proposalId, msg.sender, support);
    }
    
    /**
     * @dev Execute proposal after voting period ends
     */
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp > proposal.votingEnds, "Voting still active");
        require(!proposal.executed, "Already executed");
        
        VotingConfig storage config = circleVotingConfig[proposal.circleId];
        address[] memory members = grove.getMembers(proposal.circleId);
        uint256 totalMembers = members.length;
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        
        // Check quorum
        uint256 requiredQuorum = (totalMembers * config.quorumPercentage) / 100;
        bool quorumMet = totalVotes >= requiredQuorum;
        
        // Check approval
        bool approved = false;
        if (quorumMet && totalVotes > 0) {
            uint256 approvalRate = (proposal.votesFor * 100) / totalVotes;
            approved = approvalRate >= config.approvalPercentage;
        }
        
        proposal.executed = true;
        proposal.passed = approved && quorumMet;
        
        emit ProposalExecuted(proposalId, proposal.passed, proposal.amount);
        
        // If proposal passed, execute withdrawal via InheritanceModule
        if (proposal.passed) {
            // Use escrow funds to honor the vote
            require(circleEscrowBalance[proposal.circleId] >= proposal.amount, "Insufficient escrow");
            circleEscrowBalance[proposal.circleId] -= proposal.amount;
            
            // Send funds directly to recipient
            (bool success, ) = proposal.recipient.call{value: proposal.amount}("");
            require(success, "Transfer failed");
            
            emit WithdrawalExecuted(proposalId, proposal.circleId, proposal.amount, proposal.recipient);
        }
    }
    
    /**
     * @dev Circle owner deposits funds into escrow for voting
     * This enables democratic withdrawal from the deposited funds
     */
    function depositEscrow(uint256 circleId) external payable onlyCircleOwner(circleId) {
        require(msg.value > 0, "Must deposit funds");
        circleEscrowBalance[circleId] += msg.value;
        
        emit EscrowDeposited(circleId, msg.sender, msg.value);
    }
    
    /**
     * @dev Circle owner withdraws unused escrow funds
     */
    function withdrawEscrow(uint256 circleId, uint256 amount) external onlyCircleOwner(circleId) {
        require(circleEscrowBalance[circleId] >= amount, "Insufficient escrow");
        circleEscrowBalance[circleId] -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit EscrowWithdrawn(circleId, msg.sender, amount);
    }
    
    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        uint256 circleId,
        address proposer,
        address recipient,
        uint256 amount,
        string memory description,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 createdAt,
        uint256 votingEnds,
        bool executed,
        bool passed
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.circleId,
            proposal.proposer,
            proposal.recipient,
            proposal.amount,
            proposal.description,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.createdAt,
            proposal.votingEnds,
            proposal.executed,
            proposal.passed
        );
    }
    
    /**
     * @dev Get active proposals for a circle
     */
    function getCircleProposals(uint256 circleId) external view returns (uint256[] memory) {
        return circleProposals[circleId];
    }
    
    /**
     * @dev Check if address has voted on proposal
     */
    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }
    
    /**
     * @dev Get vote choice for address on proposal
     */
    function getVoteChoice(uint256 proposalId, address voter) external view returns (bool) {
        require(proposals[proposalId].hasVoted[voter], "Has not voted");
        return proposals[proposalId].voteChoice[voter];
    }
}
