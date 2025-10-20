import React from "react";
import './Skeleton.css';

export type TSkeleton = {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton:React.FC<TSkeleton> = ({width = '100%', height = '100%', borderRadius}) => {
return (
  <div
  className='skeleton'
  style={{width, height, borderRadius}}></div>
);
}