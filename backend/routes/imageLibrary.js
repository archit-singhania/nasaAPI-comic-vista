const express = require('express');
const { fetchFromNasa } = require('../services/nasaService');
const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    console.log('🔍 Image Library Search API called');
    console.log('Query params:', req.query);
    
    const queryParams = {
      ...req.query,
      media_type: req.query.media_type || 'image',
      page_size: Math.min(parseInt(req.query.page_size) || 100, 100), 
    };

    const data = await fetchFromNasa('https://images-api.nasa.gov/search', queryParams);
    res.json(data);
  } catch (err) {
    console.error('❌ Image Library Search Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/asset/:nasa_id', async (req, res) => {
  try {
    const { nasa_id } = req.params;
    console.log('📄 Fetching asset manifest for:', nasa_id);
    
    if (!nasa_id) {
      return res.status(400).json({ error: 'NASA ID is required' });
    }

    const data = await fetchFromNasa(`https://images-api.nasa.gov/asset/${nasa_id}`, req.query);
    res.json(data);
  } catch (err) {
    console.error('❌ Asset Manifest Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/metadata/:nasa_id', async (req, res) => {
  try {
    const { nasa_id } = req.params;
    console.log('📊 Fetching metadata for:', nasa_id);
    
    if (!nasa_id) {
      return res.status(400).json({ error: 'NASA ID is required' });
    }

    const data = await fetchFromNasa(`https://images-api.nasa.gov/metadata/${nasa_id}`, req.query);
    res.json(data);
  } catch (err) {
    console.error('❌ Metadata Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/captions/:nasa_id', async (req, res) => {
  try {
    const { nasa_id } = req.params;
    console.log('📹 Fetching captions for:', nasa_id);
    
    if (!nasa_id) {
      return res.status(400).json({ error: 'NASA ID is required' });
    }

    const data = await fetchFromNasa(`https://images-api.nasa.gov/captions/${nasa_id}`, req.query);
    res.json(data);
  } catch (err) {
    console.error('❌ Captions Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/advanced-search', async (req, res) => {
  try {
    console.log('🔍 Advanced Search API called');
    console.log('Query params:', req.query);
    
    const {
      q,
      center,
      description,
      keywords,
      location,
      media_type,
      nasa_id,
      photographer,
      secondary_creator,
      title,
      year_start,
      year_end,
      page,
      page_size
    } = req.query;

    const queryParams = {};
    
    if (q) queryParams.q = q;
    if (center) queryParams.center = center;
    if (description) queryParams.description = description;
    if (keywords) queryParams.keywords = keywords;
    if (location) queryParams.location = location;
    if (media_type) queryParams.media_type = media_type;
    if (nasa_id) queryParams.nasa_id = nasa_id;
    if (photographer) queryParams.photographer = photographer;
    if (secondary_creator) queryParams.secondary_creator = secondary_creator;
    if (title) queryParams.title = title;
    if (year_start) queryParams.year_start = year_start;
    if (year_end) queryParams.year_end = year_end;
    if (page) queryParams.page = page;
    if (page_size) queryParams.page_size = Math.min(parseInt(page_size) || 100, 100);

    const data = await fetchFromNasa('https://images-api.nasa.gov/search', queryParams);
    res.json(data);
  } catch (err) {
    console.error('❌ Advanced Search Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/popular', async (req, res) => {
  try {
    console.log('🌟 Popular searches requested');
    
    const popularSearches = [
      'apollo 11',
      'hubble telescope',
      'mars rover',
      'international space station',
      'earth from space',
      'saturn',
      'jupiter',
      'nebula',
      'galaxy',
      'spacewalk'
    ];

    const randomSearch = popularSearches[Math.floor(Math.random() * popularSearches.length)];
    const data = await fetchFromNasa('https://images-api.nasa.gov/search', {
      q: randomSearch,
      media_type: 'image',
      page_size: 20
    });
    
    res.json({
      searchTerm: randomSearch,
      results: data
    });
  } catch (err) {
    console.error('❌ Popular Search Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/trending/topics', async (req, res) => {
  try {
    console.log('📈 Trending topics requested');
    
    const trendingTopics = [
      { term: 'artemis mission', searches: 1250 },
      { term: 'james webb telescope', searches: 1180 },
      { term: 'perseverance rover', searches: 980 },
      { term: 'ingenuity helicopter', searches: 875 },
      { term: 'spacewalk', searches: 720 },
      { term: 'aurora', searches: 650 },
      { term: 'solar eclipse', searches: 580 },
      { term: 'meteor shower', searches: 520 },
      { term: 'rocket launch', searches: 480 },
      { term: 'astronaut training', searches: 420 }
    ];

    const trendingWithData = await Promise.allSettled(
      trendingTopics.slice(0, 5).map(async (topic) => {
        try {
          const data = await fetchFromNasa('https://images-api.nasa.gov/search', {
            q: topic.term,
            media_type: 'image',
            page_size: 3
          });
          return {
            ...topic,
            sampleData: data?.collection?.items || []
          };
        } catch (error) {
          return {
            ...topic,
            sampleData: []
          };
        }
      })
    );

    const processedTrending = trendingWithData
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    res.json({ trending: processedTrending });
  } catch (err) {
    console.error('❌ Trending Topics Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/popular/search', async (req, res) => {
  try {
    console.log('🌟 Popular searches requested');
    
    const popularSearches = [
      { title: 'Apollo 11 Moon Landing', description: 'Historic first human moon landing mission', searchTerm: 'apollo 11' },
      { title: 'Mars Surface Images', description: 'Latest images from Mars rovers', searchTerm: 'mars surface' },
      { title: 'Hubble Deep Field', description: 'Deep space images from Hubble telescope', searchTerm: 'hubble deep field' },
      { title: 'Earth from Space', description: 'Beautiful images of Earth from orbit', searchTerm: 'earth from space' },
      { title: 'Solar System Planets', description: 'Images of planets in our solar system', searchTerm: 'planets solar system' },
      { title: 'Spacewalk Activities', description: 'Astronauts working outside spacecraft', searchTerm: 'spacewalk' },
      { title: 'International Space Station', description: 'Life and work aboard the ISS', searchTerm: 'international space station' },
      { title: 'Nebula Collections', description: 'Colorful cosmic clouds and star formations', searchTerm: 'nebula' },
      { title: 'Galaxy Images', description: 'Distant galaxies and cosmic structures', searchTerm: 'galaxy' },
      { title: 'Rocket Launches', description: 'Spectacular rocket launch moments', searchTerm: 'rocket launch' }
    ];

    const popularWithData = await Promise.allSettled(
      popularSearches.map(async (search) => {
        try {
          const data = await fetchFromNasa('https://images-api.nasa.gov/search', {
            q: search.searchTerm,
            media_type: 'image',
            page_size: 4
          });
          return {
            ...search,
            previewImages: data?.collection?.items || []
          };
        } catch (error) {
          return {
            ...search,
            previewImages: []
          };
        }
      })
    );

    const processedPopular = popularWithData
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    res.json(processedPopular);
  } catch (err) {
    console.error('❌ Popular Search Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/collections/featured', async (req, res) => {
  try {
    console.log('🎯 Featured collections requested');
    
    const featuredCollections = [
      {
        title: 'Apollo Program',
        description: 'Complete collection of Apollo mission images and videos',
        searchTerm: 'apollo program',
        color: 'from-blue-500 to-purple-600'
      },
      {
        title: 'Mars Exploration',
        description: 'Comprehensive Mars rover and orbital imagery',
        searchTerm: 'mars exploration',
        color: 'from-red-500 to-orange-600'
      },
      {
        title: 'Hubble Legacy',
        description: 'Hubble Space Telescope\'s greatest discoveries',
        searchTerm: 'hubble legacy',
        color: 'from-purple-500 to-pink-600'
      },
      {
        title: 'ISS Operations',
        description: 'Life and work aboard the International Space Station',
        searchTerm: 'iss operations',
        color: 'from-green-500 to-blue-600'
      },
      {
        title: 'Deep Space Images',
        description: 'Galaxies, nebulae, and distant cosmic objects',
        searchTerm: 'deep space',
        color: 'from-indigo-500 to-purple-600'
      },
      {
        title: 'Earth Science',
        description: 'Our planet from space and climate monitoring',
        searchTerm: 'earth science',
        color: 'from-green-500 to-cyan-600'
      }
    ];

    const collectionsWithData = await Promise.allSettled(
      featuredCollections.map(async (collection) => {
        try {
          const data = await fetchFromNasa('https://images-api.nasa.gov/search', {
            q: collection.searchTerm,
            media_type: 'image',
            page_size: 6
          });
          return {
            ...collection,
            itemCount: data?.collection?.metadata?.total_hits || 0,
            previewImages: data?.collection?.items || []
          };
        } catch (error) {
          return {
            ...collection,
            itemCount: 0,
            previewImages: []
          };
        }
      })
    );

    const processedCollections = collectionsWithData
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    res.json({ collections: processedCollections });
  } catch (err) {
    console.error('❌ Featured Collections Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/trending/realtime', async (req, res) => {
  try {
    console.log('⚡ Real-time trending requested');
    
    const realtimeTrending = [
      { term: 'james webb telescope', recentSearches: 340, category: 'Deep Space' },
      { term: 'mars perseverance', recentSearches: 285, category: 'Mars' },
      { term: 'artemis mission', recentSearches: 220, category: 'Lunar' },
      { term: 'solar eclipse', recentSearches: 195, category: 'Solar System' },
      { term: 'hubble images', recentSearches: 180, category: 'Deep Space' },
      { term: 'iss spacewalk', recentSearches: 165, category: 'ISS' },
      { term: 'saturn rings', recentSearches: 150, category: 'Planets' },
      { term: 'apollo 11', recentSearches: 135, category: 'Historic' },
      { term: 'galaxy collision', recentSearches: 120, category: 'Deep Space' },
      { term: 'rocket launch', recentSearches: 105, category: 'Launch' }
    ];

    const trendingWithData = await Promise.allSettled(
      realtimeTrending.slice(0, 6).map(async (item) => {
        try {
          const data = await fetchFromNasa('https://images-api.nasa.gov/search', {
            q: item.term,
            media_type: 'image',
            page_size: 2
          });
          return {
            ...item,
            sampleImages: data?.collection?.items || []
          };
        } catch (error) {
          return {
            ...item,
            sampleImages: []
          };
        }
      })
    );

    const processedTrending = trendingWithData
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    const remainingItems = realtimeTrending.slice(6).map(item => ({
      ...item,
      sampleImages: []
    }));

    res.json([...processedTrending, ...remainingItems]);
  } catch (err) {
    console.error('❌ Real-time Trending Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/centers', async (req, res) => {
  try {
    const centers = [
      'ARC', 'AFRC', 'GRC', 'GSFC', 'HQ', 'JPL', 'JSC', 'KSC', 'LARC', 
      'MSFC', 'SSC', 'WSMR', 'IVATEST', 'IVAOAG', 'LRC', 'DFRC'
    ];
    
    res.json({ centers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/batch-assets', async (req, res) => {
  try {
    const { nasa_ids } = req.body;
    
    if (!Array.isArray(nasa_ids) || nasa_ids.length === 0) {
      return res.status(400).json({ error: 'nasa_ids array is required' });
    }

    if (nasa_ids.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 assets per batch request' });
    }

    const assets = await Promise.allSettled(
      nasa_ids.map(async (nasa_id) => {
        try {
          const asset = await fetchFromNasa(`https://images-api.nasa.gov/asset/${nasa_id}`, req.query);
          return { nasa_id, asset, status: 'fulfilled' };
        } catch (error) {
          return { nasa_id, error: error.message, status: 'rejected' };
        }
      })
    );

    res.json({ assets });
  } catch (err) {
    console.error('❌ Batch Assets Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    console.log('💡 Search suggestions requested for:', q);
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }

    const allSuggestions = [
      { title: 'Apollo missions', description: 'Historic moon landing missions' },
      { title: 'Mars rover images', description: 'Latest images from Mars exploration' },
      { title: 'Hubble telescope', description: 'Deep space images and discoveries' },
      { title: 'International Space Station', description: 'Life and work in space' },
      { title: 'Saturn rings', description: 'Beautiful images of Saturn and its rings' },
      { title: 'Earth from space', description: 'Our planet as seen from orbit' },
      { title: 'Solar system planets', description: 'Images of planets in our solar system' },
      { title: 'Nebula images', description: 'Colorful cosmic clouds and formations' },
      { title: 'Galaxy images', description: 'Distant galaxies and star formations' },
      { title: 'Spacewalk activities', description: 'Astronauts working outside spacecraft' },
      { title: 'James Webb telescope', description: 'Latest images from JWST' },
      { title: 'Artemis mission', description: 'NASA\'s return to the Moon program' },
      { title: 'Solar eclipse', description: 'Eclipse images and phenomena' },
      { title: 'Aurora borealis', description: 'Northern lights from space and Earth' },
      { title: 'Rocket launches', description: 'Spectacular rocket launch moments' }
    ];

    const filteredSuggestions = allSuggestions.filter(suggestion =>
      suggestion.title.toLowerCase().includes(q.toLowerCase()) ||
      suggestion.description.toLowerCase().includes(q.toLowerCase())
    );

    const suggestions = filteredSuggestions.length > 0 ? filteredSuggestions : allSuggestions.slice(0, 5);

    res.json(suggestions);
  } catch (err) {
    console.error('❌ Search Suggestions Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;