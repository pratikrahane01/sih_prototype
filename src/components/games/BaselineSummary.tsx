import React from 'react';
import type { BaselineSession } from '../../types';
import { Brain, Star, Activity, Map } from 'lucide-react';


interface Props {
  session: BaselineSession;
}

export const BaselineSummary: React.FC<Props> = ({ session }) => {

  const getIcon = (domain: string) => {
    switch(domain) {
      case 'memory': return <Brain className="w-8 h-8 text-ai-blue" />;
      case 'attention': return <Star className="w-8 h-8 text-attention-amber" />;
      case 'pattern': return <Activity className="w-8 h-8 text-primary-teal" />;
      case 'spatial': return <Map className="w-8 h-8 text-secondary-sage" />;
      default: return <Brain className="w-8 h-8 text-primary-teal" />;
    }
  };

  const formatScore = (score: number) => {
    return Math.round(score);
  };

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto text-center w-full">
      <h2 className="text-4xl font-bold text-primary-teal mb-4">Your activity profile is ready.</h2>
      <p className="text-xl text-text-charcoal/80 mb-10">
        We've personalized your experience based on these results.
      </p>
      
      <div className="w-full bg-white p-8 rounded-2xl shadow-sm border-2 border-secondary-sage/20 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {session.domains.map(d => (
            <div key={d.domain} className="flex items-center p-4 bg-background-warm rounded-xl border border-gray-200">
              <div className="mr-4">
                {getIcon(d.domain)}
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold capitalize">{d.domain}</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-primary-teal h-2.5 rounded-full" style={{ width: `${d.score}%` }}></div>
                </div>
              </div>
              <div className="ml-4 text-2xl font-bold text-primary-teal">
                {formatScore(d.score)}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
