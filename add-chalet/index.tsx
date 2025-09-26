import { useChaletContext } from '@/context/use-chalet';
import React, { useState } from 'react';
import { ChaletDetailsStep } from './chalet-detail';
import { ChaletProvider } from '@/context/chalet-provider';
import { RoomDetailsStep } from './room-detail';
import { ChaletAvailabilityStep } from './chalet-availability-step';
import { LocationStep } from './location-step';
import { AmenitiesStep } from './amenities';
import { API_URL } from '@/config';
import { ReviewStep } from './review-step';
import { ChaletImagesStep } from './chalet-images';
import axios, { AxiosError } from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ErrorResponse {
  message?: string; // Define the structure of the error response
}

const AddChalet: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);
  const { chaletData, resetChaletData } = useChaletContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      // Validate all required fields
      if (!validateSubmission()) {
        return;
      }

      // Prepare data for submission
      const submissionData = prepareSubmissionData();
      setLoading(true);

      // Submit data to the API
      const response = await axios.post(`${API_URL}/v1/chalets/create`, submissionData);

      // Show success toast
      toast({
        variant: 'success',
        title: 'Chalet created successfully',
        description: `${response?.data?.message}`,
      });

      // Reset form and navigate only after a successful response
      resetChaletData();
      navigate('/admin/chalets');
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>; // Cast error to AxiosError with ErrorResponse type

      toast({
        variant: 'destructive',
        title: 'Fail to create chalet',
        description: error.response?.data?.message || 'An unexpected error occurred',
      });
    } finally {
      // Always stop loading spinner
      setLoading(false);
    }
  };

  const validateSubmission = () => {
    const validationChecks = [
      {
        check: !!chaletData.chaletDetails?.name,
        message: 'Chalet details are incomplete',
      },
    ];

    const failedChecks = validationChecks.filter((check) => !check.check);

    if (failedChecks.length > 0) {
      failedChecks.forEach((check) => {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: check.message,
        });
      });
      return false;
    }

    return true;
  };

  const prepareSubmissionData = () => {
    // Transform context data into a format expected by backend
    return {
      ...chaletData,
      // Add any additional transformations or metadata
      createdAt: new Date().toISOString(),
    };
  };

  const renderStep = () => {
    const stepComponents = {
      1: () => <ChaletDetailsStep setCurrentStep={setCurrentStep} setTotalRooms={setTotalRooms} />,
      2: () => <RoomDetailsStep setCurrentStep={setCurrentStep} totalRooms={totalRooms} />,
      3: () => <ChaletImagesStep setCurrentStep={setCurrentStep} />,
      4: () => <ChaletAvailabilityStep setCurrentStep={setCurrentStep} />,
      5: () => <LocationStep setCurrentStep={setCurrentStep} />,
      6: () => <AmenitiesStep setCurrentStep={setCurrentStep} />,
      7: () => (
        <ReviewStep
          setCurrentStep={setCurrentStep}
          handleSubmit={handleSubmit}
          isLoading={loading}
        />
      ),
    };

    return stepComponents[currentStep as keyof typeof stepComponents]?.();
  };
  return <div className="flex justify-center items-center p-4">{renderStep()}</div>;
};

// Wrapper component to provide context
const AddChaletWithProvider: React.FC = () => (
  <ChaletProvider>
    <AddChalet />
  </ChaletProvider>
);

export default AddChaletWithProvider;
