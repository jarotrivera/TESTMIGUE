const searchAddress = async (req, res) => {
    try {
      // Importación dinámica de node-fetch
      const fetch = (await import('node-fetch')).default;
      const { query } = req.query;
      
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=CL&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      res.json(data); // Enviar los datos de vuelta al cliente
    } catch (error) {
      console.error('Error al buscar dirección:', error);
      res.status(500).json({ message: 'Error al buscar dirección' });
    }
  };
  
  module.exports = { searchAddress };