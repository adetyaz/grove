// import { NextResponse } from "next/server";
// import { groveABI } from "@/contracts/constants";
// import { getDynamicUser } from "@/lib/dynamic";
// import { getWalletClient } from "@/lib/web3";

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const circleId = searchParams.get("circle");
//   const email = searchParams.get("email");

//   // 1. Get or create user wallet via Dynamic
//   const { walletAddress } = await getDynamicUser(email!);

//   // 2. Add to circle via contract
//   const walletClient = getWalletClient();
//   await walletClient.writeContract({
//     address: groveContractAddress,
//     abi: groveABI,
//     functionName: "addMember",
//     args: [Number(circleId), walletAddress],
//   });

//   return NextResponse.redirect(`/circles/${circleId}`);
// }
