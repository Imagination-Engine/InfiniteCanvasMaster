import React from 'react';
import { Controller } from 'react-hook-form';

export function StoryStep({ control, errors }: any) {
  return (
    <div>
      <h3 className="text-md font-medium mb-2">Step 1: Story</h3>
      <p className="text-sm text-gray-500 mb-4">
        What is this agent for? Who or what imagined it? What will it help with?
      </p>
      <Controller
        name="story"
        control={control}
        render={({ field }) => (
          <textarea
            {...field}
            className="w-full border rounded p-2 min-h-[100px]"
            aria-label="Story"
          />
        )}
      />
      {errors.story && (
        <p className="text-red-500 text-sm mt-1">{errors.story.message}</p>
      )}
    </div>
  );
}

export function PersonaStep({ control }: any) {
  return (
    <div>
      <h3 className="text-md font-medium mb-2">Step 2: Persona</h3>
      <p className="text-sm text-gray-500 mb-4">
        Define the identity of your agent.
      </p>
      <Controller
        name="persona.name"
        control={control}
        render={({ field }) => (
          <input
            {...field}
            className="w-full border rounded p-2 mb-2"
            aria-label="Persona Name"
            placeholder="Name"
          />
        )}
      />
      <Controller
        name="persona.tagline"
        control={control}
        render={({ field }) => (
          <input
            {...field}
            className="w-full border rounded p-2 mb-2"
            aria-label="Tagline"
            placeholder="Tagline"
          />
        )}
      />
    </div>
  );
}

export function SkillsStep() {
  return (
    <div>
      <h3 className="text-md font-medium mb-2">Step 3: Skills</h3>
      <p className="text-sm text-gray-500 mb-4">Select MCP tools this agent can use.</p>
      <div className="flex flex-col gap-2">
        {['web_search', 'file_read', 'code_execution', 'image_generation'].map(skill => (
          <label key={skill} className="flex items-center gap-2">
            <input type="checkbox" value={skill} />
            <span>{skill.replace('_', ' ')}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function ContextStep() {
  return (
    <div>
      <h3 className="text-md font-medium mb-2">Step 4: Context</h3>
      <p className="text-sm text-gray-500 mb-4">Upload files or provide URLs.</p>
      <input type="file" className="w-full border rounded p-2" />
    </div>
  );
}

export function CapabilitiesStep() {
  return (
    <div>
      <h3 className="text-md font-medium mb-2">Step 5: Capabilities</h3>
      <p className="text-sm text-gray-500 mb-4">Execution mode and output types.</p>
      <select className="w-full border rounded p-2">
        <option value="triggered">Triggered</option>
        <option value="streaming">Streaming</option>
        <option value="ambient">Ambient</option>
      </select>
    </div>
  );
}

export function PurposeStep({ control }: any) {
  return (
    <div>
      <h3 className="text-md font-medium mb-2">Step 6: Purpose</h3>
      <p className="text-sm text-gray-500 mb-4">One-sentence summary for the palette.</p>
      <Controller
        name="purpose"
        control={control}
        render={({ field }) => (
          <input
            {...field}
            className="w-full border rounded p-2"
            aria-label="Purpose"
            placeholder="E.g., Summarizes long documents."
          />
        )}
      />
    </div>
  );
}
