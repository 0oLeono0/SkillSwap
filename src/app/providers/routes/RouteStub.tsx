import { useLocation } from 'react-router-dom';

type RouteStubProps = {
  title: string;
};

export const RouteStub = ({ title }: RouteStubProps) => {
  const { pathname } = useLocation();

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>{title}</h1>
      <p style={{ opacity: 0.7, marginTop: 8 }}>
        Current path: <code>{pathname}</code>
      </p>
    </div>
  );
};
