import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Mocking the schema update we expect in blockTypes
const CoordinateSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const TemporalCoordinateSchema = z.object({
  track: z.number(),
  time: z.number(),
  duration: z.number(),
});

const BlockPositionSchema = z.object({
  spatial: CoordinateSchema,
  temporal: TemporalCoordinateSchema.optional(),
});

describe('Block Position Schema', () => {
  it('validates spatial coordinates', () => {
    const valid = { spatial: { x: 10, y: 20 } };
    expect(BlockPositionSchema.parse(valid)).toEqual(valid);
  });

  it('validates combined spatial and temporal coordinates', () => {
    const valid = { 
      spatial: { x: 10, y: 20 },
      temporal: { track: 1, time: 100, duration: 50 }
    };
    expect(BlockPositionSchema.parse(valid)).toEqual(valid);
  });

  it('fails on invalid temporal coordinates', () => {
    const invalid = { 
      spatial: { x: 10, y: 20 },
      temporal: { track: "first", time: 100 } // track should be number, duration missing
    };
    expect(() => BlockPositionSchema.parse(invalid)).toThrow();
  });
});
