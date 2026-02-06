import { NextResponse } from 'next/server';

const LENS_API_ENDPOINT = 'https://api.lens.xyz/graphql';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const query = `
        query AccountsAvailable($request: AccountsAvailableRequest!) {
            accountsAvailable(request: $request) {
                items {
                    ... on AccountManaged {
                        account {
                            address
                            username {
                                localName
                            }
                            metadata {
                                name
                                bio
                                picture
                            }
                        }
                    }
                    ... on AccountOwned {
                        account {
                            address
                            username {
                                localName
                            }
                            metadata {
                                name
                                bio
                                picture
                            }
                        }
                    }
                }
            }
        }
    `;

    try {
        const response = await fetch(LENS_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables: { request: { managedBy: address } },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({
                error: 'Lens API Error',
                status: response.status,
                details: errorText
            }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('[LensFetch] Proxy Error:', e);
        return NextResponse.json({
            error: 'Lens API Connection Failed',
            details: e.message,
            code: e.code
        }, { status: 500 });
    }
}
