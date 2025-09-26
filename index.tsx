import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { useChalets } from './hooks/useChalets';

const Chalets = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useChalets();

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500">Error loading chalets. Please try again later.</div>
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>Chalets</title>
      </Helmet>

      <div className="max-w-screen-2xl w-full pb-10">
        <Card className="border-none drop-shadow-sm">
          <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-xl text-[#1a3733] line-clamp-1">
                Chalets Management
              </CardTitle>
              <Button
                onClick={() => navigate('/admin/chalets/add-chalet')}
                className="bg-[#27534c] text-primary-foreground shadow hover:bg-[#1a3733]"
              >
                <Plus className="size-4 mr-2" />
                Add New Chalet
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={data || []} filterKey="name" isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chalets;
