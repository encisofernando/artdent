import React from 'react';
import { Box} from '@mui/material'; 
import Card1 from './Card1';
import Card2 from './Card2';
import Card3 from './Card3';

const Settings = () => {


  return (
    <Box display="flex" flexDirection="column"> 
      <Box display="flex" flexDirection="column" gap={2}> {/* Box para las cartas */}
        <Card1 />
        <Card2 />
        <Card3 />
      </Box>
    </Box>
  );
};

export default Settings;
