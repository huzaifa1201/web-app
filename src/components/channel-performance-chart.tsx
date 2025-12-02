'use client';

import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { viewsData as defaultViewsData } from '@/lib/data';
import { getYouTubeViewsData } from '@/lib/youtube-api';
import { useUser } from '@/firebase/auth/use-user';

export function ChannelPerformanceChart() {
  const { user } = useUser();
  const [viewsData, setViewsData] = useState(defaultViewsData);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const data = await getYouTubeViewsData(user.uid);
          if (data.length > 0) {
            setViewsData(data);
          }
        } catch (error) {
          console.error('Error fetching views data:', error);
        }
      }
    };
    fetchData();
  }, [user]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={viewsData}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value / 1000}k`}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
          }}
        />
        <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
