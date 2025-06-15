import React from 'react';

interface AirQualityProps {
  aqi: number;
  pollution: {
    pm2_5: number;
    pm10: number;
    co: number;
    no2: number;
    so2: number;
    o3: number;
  };
}

const AirQuality: React.FC<AirQualityProps> = ({ aqi, pollution }) => {
  const getHealthRecommendation = (aqi: number): string => {
    if (aqi <= 50) return 'Good air quality. Enjoy outdoor activities!';
    if (aqi <= 100) return 'Moderate air quality. Sensitive individuals should limit outdoor activities.';
    if (aqi <= 150) return 'Unhealthy for sensitive groups. Limit outdoor activities.';
    if (aqi <= 200) return 'Unhealthy. Avoid outdoor activities.';
    if (aqi <= 300) return 'Very unhealthy. Stay indoors.';
    return 'Hazardous. Avoid all outdoor activities.';
  };

  return (
    <div className="air-quality">
      <h2>Air Quality</h2>
      <p>AQI: {aqi}</p>
      <p>Health Recommendation: {getHealthRecommendation(aqi)}</p>
      <h3>Pollutant Levels:</h3>
      <ul>
        <li>PM2.5: {pollution.pm2_5} μg/m³</li>
        <li>PM10: {pollution.pm10} μg/m³</li>
        <li>CO: {pollution.co} μg/m³</li>
        <li>NO2: {pollution.no2} μg/m³</li>
        <li>SO2: {pollution.so2} μg/m³</li>
        <li>O3: {pollution.o3} μg/m³</li>
      </ul>
    </div>
  );
};

export default AirQuality; 