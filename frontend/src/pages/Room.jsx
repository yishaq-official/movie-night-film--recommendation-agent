import { useParams } from 'react-router-dom';
export default function Room() {
  const { roomId } = useParams();
  return <div>Room Code: {roomId} - Waiting for users...</div>;
}