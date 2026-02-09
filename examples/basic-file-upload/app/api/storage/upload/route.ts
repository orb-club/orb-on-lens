import { NextResponse, type NextRequest } from "next/server";
import { StorageClient, lensAccountOnly } from "@lens-chain/storage-client";
import { chains } from "@lens-chain/sdk/viem";

const storageClient = StorageClient.create();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const account = formData.get("account") as string | null;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    if (!account) {
      return NextResponse.json(
        { message: "No account address provided" },
        { status: 400 }
      );
    }

    const acl = lensAccountOnly(account as `0x${string}`, chains.mainnet.id);
    const response = await storageClient.uploadFile(file, { acl });

    return NextResponse.json({
      message: "File uploaded",
      uri: response.uri,
      gatewayUrl: response.gatewayUrl,
      storageKey: response.storageKey,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
