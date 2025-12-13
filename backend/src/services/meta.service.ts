import axios from "axios";
import { env } from "../config/env";

const META_VERSION = "v20.0";
const GRAPH_BASE = `https://graph.facebook.com/${META_VERSION}`;
const OAUTH_DIALOG = `https://www.facebook.com/${META_VERSION}/dialog/oauth`;
const META_SCOPES = [
  "ads_management",
  "ads_read",
  "business_management",
  "read_insights",
];

export interface MetaTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export class MetaService {
  static getLoginUrl(state: string) {
    const params = new URLSearchParams({
      client_id: env.META_APP_ID,
      redirect_uri: env.META_REDIRECT_URI,
      scope: META_SCOPES.join(","),
      response_type: "code",
      state,
    });
    return `${OAUTH_DIALOG}?${params.toString()}`;
  }

  static async exchangeCodeForToken(code: string): Promise<MetaTokenResponse> {
    const { data } = await axios.get(`${GRAPH_BASE}/oauth/access_token`, {
      params: {
        client_id: env.META_APP_ID,
        client_secret: env.META_APP_SECRET,
        redirect_uri: env.META_REDIRECT_URI,
        code,
      },
    });
    return { accessToken: data.access_token as string, expiresIn: data.expires_in as number };
  }

  static async exchangeForLongLivedToken(token: string): Promise<MetaTokenResponse> {
    const { data } = await axios.get(`${GRAPH_BASE}/oauth/access_token`, {
      params: {
        grant_type: "fb_exchange_token",
        client_id: env.META_APP_ID,
        client_secret: env.META_APP_SECRET,
        fb_exchange_token: token,
      },
    });
    return { accessToken: data.access_token as string, expiresIn: data.expires_in as number };
  }
}
