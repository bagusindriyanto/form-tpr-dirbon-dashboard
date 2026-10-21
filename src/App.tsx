import ProblemFormDialog from './components/ProblemFormDialog';
import ProblemListDialog from './components/ProblemListDialog';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Separator } from './components/ui/separator';

function App() {
  return (
    <main className="grid place-items-center px-6 min-h-screen bg-muted">
      <Card className="w-full max-w-2xl p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Form Problem Pattern Sewer
          </CardTitle>
        </CardHeader>
        <Separator className="my-2" />
        <CardContent className="px-0 flex flex-col gap-3">
          <ProblemFormDialog />
          <ProblemListDialog />
        </CardContent>
      </Card>
    </main>
  );
}

export default App;
