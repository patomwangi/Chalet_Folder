// import { useQuery } from '@tanstack/react-query';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
// import { ApiResponse } from './types/type';
// import { API_URL } from '@/config';
import { Helmet } from 'react-helmet-async';

const EditChaletPage = () => {
  // const params = useParams();

  // const { data, isLoading, error } = useQuery({
  //   queryKey: ['chalet'],
  //   queryFn: async () => {
  //     const response = await axios.get<ApiResponse>(`${API_URL}/v1/chalets/${params.id}`);

  //     return response.data.chalet; // Extract the chalets array from the response
  //   },
  // });

  return (
    <div className="py-5 max-w-4xl mx-auto">
      <Helmet>
        <title>Edit Chalet</title>
      </Helmet>

      <div className="space-y-8">
        <div className="mb-4 col-span-full xl:mb-2">
          <h1 className="font-bold text-3xl mb-5 text-[#27534c]">Edit Chalet</h1>
        </div>
      </div>
    </div>
  );
};

export default EditChaletPage;
