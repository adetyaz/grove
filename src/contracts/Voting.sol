// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Treasury.sol";
import "./Grove.sol";

/**
 * @title Voting - Fully Decentralized Democratic Governance
 * @notice Zero admin dependencies - fully autonomous user-driven system
 * @dev Stack-optimized with direct Grove/Treasury integration
 */
contract Voting is AccessControl {
    Treasury public treasury;
    Grove public grove;
    
    // Proposal storage - split to avoid stack issues
    mapping(uint256 => uint256) public proposalCircleId;
    mapping(uint256 => address) public proposalProposer;
    mapping(uint256 => address) public proposalRecipient;
    mapping(uint256 => uint256) public proposalAmount;
    mapping(uint256 => string) public proposalDescription;
    mapping(uint256 => uint256) public proposalVotesFor;
    mapping(uint256 => uint256) public proposalVotesAgainst;
    mapping(uint256 => uint256) public proposalCreatedAt;
    mapping(uint256 => uint256) public proposalVotingEnds;
    mapping(uint256 => bool) public proposalExecuted;
    mapping(uint256 => bool) public proposalPassed;
    
    // Voting tracking
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => bool)) public voteChoice;
    
    // Per-circle voting configuration (set by circle owners only)
    mapping(uint256 => bool) public votingEnabled;
    mapping(uint256 => uint256) public votingPeriod;
    mapping(uint256 => uint256) public quorumPercentage;
    mapping(uint256 => uint256) public approvalPercentage;
    mapping(uint256 => uint256) public minimumAmount;
    
    // Circle proposals list
    mapping(uint256 => uint256[]) public circleProposals;
    
    uint256 public nextProposalId = 1;
    
    // Default constants
    uint256 public constant DEFAULT_VOTING_PERIOD = 2 days;
    uint256 public constant DEFAULT_QUORUM = 50; // 50%
    uint256 public constant DEFAULT_APPROVAL = 60; // 60%
    uint256 public constant DEFAULT_MIN_AMOUNT = 0.01 ether;
    
    // Events
    event VotingEnabled(uint256 indexed circleId, address indexed owner);
    event VotingConfigured(uint256 indexed circleId, uint256 votingPeriod, uint256 quorum, uint256 approval);
    event ProposalCreated(uint256 indexed proposalId, uint256 indexed circleId, address indexed proposer);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId, bool passed, uint256 amount);
    
    constructor(address _treasury, address _grove) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        treasury = Treasury(_treasury);
        grove = Grove(_grove);
    }
    
    // ============ DECENTRALIZED CONFIGURATION ============
    // Only circle owners can configure their own circles
    
    function enableVotingForCircle(uint256 circleId) external {
        require(_isCircleOwner(circleId, msg.sender), "Not circle owner");
        
        votingEnabled[circleId] = true;
        votingPeriod[circleId] = DEFAULT_VOTING_PERIOD;
        quorumPercentage[circleId] = DEFAULT_QUORUM;
        approvalPercentage[circleId] = DEFAULT_APPROVAL;
        minimumAmount[circleId] = DEFAULT_MIN_AMOUNT;
        
        emit VotingEnabled(circleId, msg.sender);
    }
    
    function configureCircleVoting(
        uint256 circleId,
        uint256 _votingPeriod,
        uint256 _quorumPercentage,
        uint256 _approvalPercentage,
        uint256 _minimumAmount
    ) external {
        require(_isCircleOwner(circleId, msg.sender), "Not circle owner");
        require(_quorumPercentage > 0 && _quorumPercentage <= 100, "Invalid quorum");
        require(_approvalPercentage > 50 && _approvalPercentage <= 100, "Invalid approval");
        
        votingPeriod[circleId] = _votingPeriod;
        quorumPercentage[circleId] = _quorumPercentage;
        approvalPercentage[circleId] = _approvalPercentage;
        minimumAmount[circleId] = _minimumAmount;
        
        emit VotingConfigured(circleId, _votingPeriod, _quorumPercentage, _approvalPercentage);
    }
    
    // ============ PROPOSAL MANAGEMENT ============
    
    function createProposal(
        uint256 circleId,
        address recipient,
        uint256 amount,
        string calldata description
    ) external returns (uint256 proposalId) {
        require(grove.isMemberOf(circleId, msg.sender), "Not circle member");
        require(votingEnabled[circleId], "Voting not enabled for circle");
        require(amount >= minimumAmount[circleId], "Amount below minimum");
        require(recipient != address(0), "Invalid recipient");
        require(_hasEnoughBalance(circleId, amount), "Insufficient circle funds");
        
        proposalId = nextProposalId++;
        
        proposalCircleId[proposalId] = circleId;
        proposalProposer[proposalId] = msg.sender;
        proposalRecipient[proposalId] = recipient;
        proposalAmount[proposalId] = amount;
        proposalDescription[proposalId] = description;
        proposalCreatedAt[proposalId] = block.timestamp;
        proposalVotingEnds[proposalId] = block.timestamp + votingPeriod[circleId];
        
        circleProposals[circleId].push(proposalId);
        
        emit ProposalCreated(proposalId, circleId, msg.sender);
        return proposalId;
    }
    
    function voteOnProposal(uint256 proposalId, bool support) external {
        require(proposalCircleId[proposalId] != 0, "Proposal does not exist");
        require(block.timestamp <= proposalVotingEnds[proposalId], "Voting period ended");
        require(!proposalExecuted[proposalId], "Proposal already executed");
        require(grove.isMemberOf(proposalCircleId[proposalId], msg.sender), "Not circle member");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        
        hasVoted[proposalId][msg.sender] = true;
        voteChoice[proposalId][msg.sender] = support;
        
        if (support) {
            proposalVotesFor[proposalId]++;
        } else {
            proposalVotesAgainst[proposalId]++;
        }
        
        emit VoteCast(proposalId, msg.sender, support);
    }
    
    function executeProposal(uint256 proposalId) external {
        require(proposalCircleId[proposalId] != 0, "Proposal does not exist");
        require(block.timestamp > proposalVotingEnds[proposalId], "Voting still active");
        require(!proposalExecuted[proposalId], "Already executed");
        
        bool passed = _calculateProposalResult(proposalId);
        
        proposalExecuted[proposalId] = true;
        proposalPassed[proposalId] = passed;
        
        if (passed) {
            treasury.executeVotingWithdrawal(
                proposalCircleId[proposalId],
                proposalRecipient[proposalId],
                proposalAmount[proposalId]
            );
        }
        
        emit ProposalExecuted(proposalId, passed, proposalAmount[proposalId]);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getProposalBasics(uint256 proposalId) external view returns (
        uint256 circleId,
        address proposer,
        address recipient,
        uint256 amount
    ) {
        return (
            proposalCircleId[proposalId],
            proposalProposer[proposalId],
            proposalRecipient[proposalId],
            proposalAmount[proposalId]
        );
    }
    
    function getProposalVoting(uint256 proposalId) external view returns (
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 votingEnds,
        bool executed,
        bool passed
    ) {
        return (
            proposalVotesFor[proposalId],
            proposalVotesAgainst[proposalId],
            proposalVotingEnds[proposalId],
            proposalExecuted[proposalId],
            proposalPassed[proposalId]
        );
    }
    
    function getProposalDescription(uint256 proposalId) external view returns (string memory) {
        return proposalDescription[proposalId];
    }
    
    function getCircleProposals(uint256 circleId) external view returns (uint256[] memory) {
        return circleProposals[circleId];
    }
    
    function getVotingConfig(uint256 circleId) external view returns (
        bool enabled,
        uint256 period,
        uint256 quorum,
        uint256 approval,
        uint256 minAmount
    ) {
        return (
            votingEnabled[circleId],
            votingPeriod[circleId],
            quorumPercentage[circleId],
            approvalPercentage[circleId],
            minimumAmount[circleId]
        );
    }
    
    function getUserVote(uint256 proposalId, address voter) external view returns (
        bool voted,
        bool choice
    ) {
        return (
            hasVoted[proposalId][voter],
            voteChoice[proposalId][voter]
        );
    }
    
    function isProposalPassing(uint256 proposalId) external view returns (bool) {
        if (proposalExecuted[proposalId]) return proposalPassed[proposalId];
        return _calculateProposalResult(proposalId);
    }
    
    // ============ INTERNAL HELPER FUNCTIONS ============
    
    function _isCircleOwner(uint256 circleId, address user) internal view returns (bool) {
        (,,,address owner,,,,,,,,) = grove.getCircle(circleId);
        return owner == user;
    }
    
    function _hasEnoughBalance(uint256 circleId, uint256 amount) internal view returns (bool) {
        (uint256 balance,,,,,,) = treasury.getCircleTreasury(circleId);
        return balance >= amount;
    }
    
    function _getCircleMemberCount(uint256 circleId) internal view returns (uint256) {
        (,,,,,,,,,,, address[] memory members) = grove.getCircle(circleId);
        return members.length;
    }
    
    function _calculateProposalResult(uint256 proposalId) internal view returns (bool) {
        return _checkProposalPassed(proposalId);
    }
    
    function _checkProposalPassed(uint256 proposalId) internal view returns (bool) {
        uint256 circleId = proposalCircleId[proposalId];
        return _evaluateVotingResult(circleId, proposalId);
    }
    
    function _evaluateVotingResult(uint256 circleId, uint256 proposalId) internal view returns (bool) {
        uint256 totalMembers = _getCircleMemberCount(circleId);
        if (totalMembers == 0) return false;
        
        return _checkQuorumAndApproval(circleId, proposalId, totalMembers);
    }
    
    function _checkQuorumAndApproval(uint256 circleId, uint256 proposalId, uint256 totalMembers) internal view returns (bool) {
        uint256 totalVotes = proposalVotesFor[proposalId] + proposalVotesAgainst[proposalId];
        uint256 requiredQuorum = (totalMembers * quorumPercentage[circleId]) / 100;
        
        if (totalVotes < requiredQuorum) return false;
        if (totalVotes == 0) return false;
        
        uint256 approvalRate = (proposalVotesFor[proposalId] * 100) / totalVotes;
        return approvalRate >= approvalPercentage[circleId];
    }
}
