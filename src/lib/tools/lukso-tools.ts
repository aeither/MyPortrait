import { ERC725 } from '@erc725/erc725.js';
import erc725schema from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json';
import { tool } from 'ai';
import { gql, request } from 'graphql-request';
import { z } from 'zod';

// Constants
const ENVIO_MAINNET_URL = 'https://envio.lukso-mainnet.universal.tech/v1/graphql';
const IPFS_GATEWAY = 'https://api.universalprofile.cloud/ipfs/';
const RPC_ENDPOINT_MAINNET = 'https://rpc.mainnet.lukso.network';

// Donation constants
const MIN_DONATION_AMOUNT = 0.001;
const MAX_DONATION_AMOUNT = 1000;

// Profile search GraphQL query
const gqlQuery = gql`
  query MyQuery($id: String!) {
    search_profiles(args: { search: $id }) {
      name
      fullName
      id
      profileImages(
        where: { error: { _is_null: true } }
        order_by: { width: asc }
      ) {
        width
        src
        url
        verified
      }
    }
  }
`;

// Types
type Profile = {
  name?: string;
  id: string;
  fullName?: string;
  profileImages?: {
    width: number;
    src: string;
    url: string;
    verified: boolean;
  }[];
};

export const luksoTools = {
  searchLuksoProfiles: tool({
    description: "Search for LUKSO Universal Profiles by name, username, or partial address",
    parameters: z.object({
      query: z.string().describe("Search term (minimum 3 characters)")
    }),
    execute: async ({ query }) => {
      if (query.length < 3) {
        return JSON.stringify({ error: "Search query must be at least 3 characters" });
      }

      try {
        const { search_profiles: data } = (await request(
          ENVIO_MAINNET_URL,
          gqlQuery,
          { id: query }
        )) as { search_profiles: Profile[] };
        // Limit results to prevent exceeding character limit
        const limitedData = data.length > 10 ? data.slice(0, 10) : data;
        
        const results = limitedData.map(profile => ({
          id: profile.id,
          name: profile.name || null,
          fullName: profile.fullName || null,
          profileImageUrl: profile.profileImages && profile.profileImages.length > 0 
            ? profile.profileImages[0].src 
            : null
        }));

        return JSON.stringify(results);
      } catch (error) {
        console.error('Search error:', error);
        return JSON.stringify({ error: "Failed to search profiles" });
      }
    }
  }),

  getLuksoProfileData: tool({
    description: "Get detailed profile data for a LUKSO Universal Profile address",
    parameters: z.object({
      address: z.string().describe("LUKSO Universal Profile address (0x...)")
    }),
    execute: async ({ address }) => {
      if (!address || !address.startsWith('0x')) {
        return JSON.stringify({ error: "Invalid address format" });
      }

      try {
        const config = { ipfsGateway: IPFS_GATEWAY };
        const profile = new ERC725(erc725schema, address, RPC_ENDPOINT_MAINNET, config);
        const fetchedData = await profile.fetchData('LSP3Profile');

        if (
          fetchedData?.value &&
          typeof fetchedData.value === 'object' &&
          'LSP3Profile' in fetchedData.value
        ) {
          const profileImagesIPFS = fetchedData.value.LSP3Profile.profileImage;
          const fullName = fetchedData.value.LSP3Profile.name;
          const profileBackground = fetchedData.value.LSP3Profile.backgroundImage;

          const profileData = {
            fullName: fullName || '',
            imgUrl: profileImagesIPFS?.[0]?.url
              ? profileImagesIPFS[0].url.replace('ipfs://', IPFS_GATEWAY)
              : 'https://tools-web-components.pages.dev/images/sample-avatar.jpg',
            background: profileBackground?.[0]?.url
              ? profileBackground[0].url.replace('ipfs://', IPFS_GATEWAY)
              : '',
            profileAddress: address,
          };

          return JSON.stringify(profileData);
        }
        
        return JSON.stringify({ error: "Could not retrieve profile data" });
      } catch (error) {
        console.error('Error fetching profile data:', error);
        return JSON.stringify({ error: "Failed to fetch profile data" });
      }
    }
  }),

  donateLyx: tool({
    description: "Send LYX tokens to a LUKSO Universal Profile address",
    parameters: z.object({
      recipientAddress: z.string().describe("Recipient's LUKSO Universal Profile address (0x...)"),
      amount: z.number()
        .min(MIN_DONATION_AMOUNT)
        .max(MAX_DONATION_AMOUNT)
        .describe(`Amount of LYX to send (${MIN_DONATION_AMOUNT}-${MAX_DONATION_AMOUNT})`)
    })
  })
};
