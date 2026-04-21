import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">ခွင့်ပြုချက်မရှိပါ</h1>
        <p className="text-muted-foreground">ဤစာမျက်နှာသည် Admin သီးသန့်ဖြစ်ပါသည်။</p>
      </div>
    );
  }
  return <>{children}</>;
};

export default ProtectedRoute;
