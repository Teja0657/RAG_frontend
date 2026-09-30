import { Auth0Provider } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const Auth0ProviderWithHistory = ({ children }) => {
  const navigate = useNavigate();
  console.log('Auth0 Domain:', import.meta.env.VITE_AUTH0_DOMAIN);
  console.log('Auth0 Client ID:', import.meta.env.VITE_AUTH0_CLIENT_ID);
  console.log('Auth0 Audience:', import.meta.env.VITE_AUTH0_AUDIENCE);
  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || '/chat', { replace: true });
  };

  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience:import.meta.env.VITE_AUTH0_AUDIENCE
      }}
      onRedirectCallback={onRedirectCallback}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;