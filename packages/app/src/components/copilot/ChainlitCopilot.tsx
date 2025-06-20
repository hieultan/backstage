/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  configApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { useEffect } from 'react';

/**
 * Loads the Chainlit Copilot widget for authenticated users.
 */
export function ChainlitCopilot() {
  const identityApi = useApi(identityApiRef);
  const configApi = useApi(configApiRef);

  useEffect(() => {
    let script: HTMLScriptElement | undefined;
    let cancelled = false;

    async function mount() {
      try {
        await identityApi.getProfileInfo();
        if (cancelled) return;
        const { token } = await identityApi.getCredentials();
        const baseUrl =
          configApi.getOptionalString('chainlit.baseUrl') ||
          'http://localhost:8000';
        script = document.createElement('script');
        script.src = `${baseUrl}/copilot/index.js`;
        script.async = true;
        script.onload = () => {
          (window as any).mountChainlitWidget?.({
            chainlitServer: baseUrl,
            userJwt: token,
          });
        };
        document.body.appendChild(script);
      } catch {
        /* ignore */
      }
    }

    mount();
    return () => {
      cancelled = true;
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, [identityApi, configApi]);

  return null;
}
