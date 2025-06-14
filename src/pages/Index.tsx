
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirecionar para a landing page para evitar loop
    navigate('/landing');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Os Fornecedores</h1>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
};

export default Index;
