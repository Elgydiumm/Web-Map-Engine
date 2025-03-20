export interface MapItemClickParams {
    id: string;
    type: string;
    location: {x: number, y: number};
    customData?: any;
  }
  
  export const handleMapItemClick = (params: MapItemClickParams) => {
    const { id, type, location } = params;
    
    console.log(`Map item clicked: ${id} (${type}) at ${location.x}, ${location.y}`);
    
    // Handle different behaviors based on item type
    switch (type) {
      case 'Town':
        console.log('Town selected - showing town details');
        return { action: 'showDetails', itemType: 'town' };
        
      case 'City':
        console.log('City selected - opening city panel');
        return { action: 'openPanel', itemType: 'city' };
        
      case 'Other':
        console.log('Other marker selected');
        return { action: 'identify', itemType: 'other' };
        
      default:
        console.log('Unknown marker type');
        return { action: 'unknown' };
    }
  };