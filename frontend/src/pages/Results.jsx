import { useParams } from 'react-router-dom';
export default function Results() {
  const { roomId } = useParams();
  return <div>Agent Results for Room: {roomId}</div>;
}