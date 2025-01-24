// cross-chain/wormhole/config.ts
export const WORMHOLE_CONFIG = {
    mainnet: {
        coreBridge: {
            ethereum: '0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B',
            solana: 'worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth'
        },
        tokenBridge: {
            ethereum: '0x3ee18B2214AFF97000D974cf647E7C347E8fa585',
            solana: 'WnFt12ZrnzZrFZkt2xsNsaNWoQribnuQ5B5FrDbwDhD'
        },
        chainIds: {
            ethereum: 2,
            solana: 1
        }
    },
    testnet: {
        coreBridge: {
            ethereum: '0x706abc4E45D419950511e474C7B9Ed348A4a716c',
            solana: '3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5'
        },
        tokenBridge: {
            ethereum: '0xF890982f9310df57d00f659cf4fd87e65adEd8d7',
            solana: 'DZnkkTmCiFWfYTfT41X3Rd1kDgozqzxWaHqsw6W4x2oe'
        },
        chainIds: {
            ethereum: 10002,
            solana: 10001
        }
    }
};