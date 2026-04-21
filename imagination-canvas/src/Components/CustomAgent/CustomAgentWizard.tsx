import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { StoryStep, PersonaStep, SkillsStep, ContextStep, CapabilitiesStep, PurposeStep } from './Steps/WizardSteps';
import { handleCustomAgentComplete } from './customAgentClient';

const wizardSchema = z.object({
  story: z.string()
    .min(1, 'Story is required')
    .max(10000, 'Story must be less than 10000 characters'),
  persona: z.object({
    name: z.string().min(1, 'Name is required'),
    tagline: z.string(),
    tone: z.string()
  }).optional(),
  skills: z.array(z.string()).default([]),
  contextSources: z.array(z.string()).default([]),
  capabilities: z.object({
    executionMode: z.string().default('triggered'),
    outputTypes: z.array(z.string()).default([])
  }).optional(),
  purpose: z.string().max(200, 'Purpose must be brief').optional(),
});

type WizardFormData = z.infer<typeof wizardSchema>;

interface CustomAgentWizardProps {
  onClose: () => void;
  onComplete: (data: WizardFormData) => void;
}

export default function CustomAgentWizard({ onClose, onComplete }: CustomAgentWizardProps) {
  const [step, setStep] = useState(1);
  const { control, handleSubmit, trigger, formState: { errors } } = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      story: '',
      persona: {
        name: '',
        tagline: '',
        tone: 'concise'
      },
      skills: [],
      contextSources: [],
      capabilities: {
        executionMode: 'triggered',
        outputTypes: []
      },
      purpose: ''
    },
    mode: 'onChange'
  });

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger('story');
    } else if (step === 2) {
      isValid = await trigger('persona.name');
    } else {
      isValid = true;
    }
    
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const onSubmit = async (data: WizardFormData) => {
    try {
      await handleCustomAgentComplete(data);
      onComplete(data);
      onClose();
    } catch (error) {
      console.error('Failed to create custom agent:', error);
      // In a real app, we'd set a form error or toast here
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl flex flex-col z-50 transform transition-transform duration-300">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Create Custom Agent</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          &times;
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <form id="wizard-form" onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && <StoryStep control={control} errors={errors} />}
          {step === 2 && <PersonaStep control={control} />}
          {step === 3 && <SkillsStep />}
          {step === 4 && <ContextStep />}
          {step === 5 && <CapabilitiesStep />}
          {step === 6 && <PurposeStep control={control} />}
        </form>
      </div>

      <div className="p-4 border-t flex justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((prev) => prev - 1)}
            className="px-4 py-2 border rounded"
          >
            Back
          </button>
        ) : <div />}

        {step < 6 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            form="wizard-form"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Complete
          </button>
        )}
      </div>
    </div>
  );
}
