import React from 'react';

export default function TypewriterEffect({ phrases }: { phrases: string[] }) {
  return <div>{phrases.map((phrase, index) => (
    <span key={index}>{phrase}</span>
  ))}</div>;
}
    