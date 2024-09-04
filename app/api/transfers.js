import { emitGameUpdate } from '../../server';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Process the transfer
    // ...

    // After successful transfer, emit game update
    const updatedGameData = await fetchUpdatedGameData(req.body.gameCode);
    emitGameUpdate(req.body.gameCode, updatedGameData);

    res.status(200).json({ message: 'Transfer successful' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}