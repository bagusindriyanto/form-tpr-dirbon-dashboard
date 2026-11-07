import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TargetDataGrid from './TargetDataGrid';
import { Pattern } from './examples/c-data-grid-31';

export default function EditContent() {
  return (
    <Tabs defaultValue="target" className="w-full min-w-0">
      <TabsList>
        <TabsTrigger value="target">Target</TabsTrigger>
        <TabsTrigger value="output">Output</TabsTrigger>
      </TabsList>
      <TabsContent value="target" className="min-w-0">
        <TargetDataGrid />
      </TabsContent>
      <TabsContent value="output" className="min-w-0">
        <Pattern />
      </TabsContent>
    </Tabs>
  );
}
