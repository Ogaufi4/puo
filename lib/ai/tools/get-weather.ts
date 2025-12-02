import { tool } from 'ai';
import { z } from 'zod';

export const getWeather = tool({
  description: 'Get the current weather at a location',
  parameters: z.object({
    latitude: z.number(),
    longitude: z.number(),
    city: z.string(),
  }),
  execute: async ({ latitude, longitude, city }) => {
    // Mock weather data
    const temperature = 20 + Math.floor(Math.random() * 10);
    const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][
      Math.floor(Math.random() * 4)
    ];
    return {
      temperature,
      conditions,
      location: city,
    };
  },
});
