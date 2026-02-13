import axios from 'axios';

export interface WeatherData {
    location: string;
    description: string;
    temperature: string;
    minTemp?: string;
    maxTemp?: string;
    rainChance: string;
    observationTime?: string;
}

export class WeatherService {
    private static CWA_API_KEY = process.env.CWA_API_KEY;
    private static BASE_URL = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore';

    static async getCountyForecast(countyName: string): Promise<WeatherData | null> {
        try {
            // F-C0032-001: 36h Forecast
            const res = await axios.get(`${this.BASE_URL}/F-C0032-001`, {
                params: {
                    Authorization: this.CWA_API_KEY,
                    locationName: countyName,
                    format: 'JSON'
                }
            });

            const location = res.data?.records?.location?.[0];
            if (!location) return null;

            const elements = location.weatherElement;
            const wx = elements.find((e: any) => e.elementName === 'Wx').time[0].parameter.parameterName;
            const pop = elements.find((e: any) => e.elementName === 'PoP').time[0].parameter.parameterName;
            const minT = elements.find((e: any) => e.elementName === 'MinT').time[0].parameter.parameterName;
            const maxT = elements.find((e: any) => e.elementName === 'MaxT').time[0].parameter.parameterName;

            return {
                location: countyName,
                description: wx,
                temperature: `${minT}°C - ${maxT}°C`,
                minTemp: minT,
                maxTemp: maxT,
                rainChance: `${pop}%`
            };
        } catch (error) {
            console.error('WeatherService Forecast Error:', error);
            return null;
        }
    }

    static async getRealtimeObservation(locationName: string): Promise<any | null> {
        try {
            // O-A0003-001: Real-time Observation
            // This setup fetches ALL stations and filters for the specific locationName (station name)
            const res = await axios.get(`${this.BASE_URL}/O-A0003-001`, {
                params: {
                    Authorization: this.CWA_API_KEY,
                    format: 'JSON'
                }
            });

            const stations = res.data?.records?.Station || [];
            const station = stations.find((s: any) => s.StationName.includes(locationName) || locationName.includes(s.StationName));

            if (!station) return null;

            return {
                stationName: station.StationName,
                county: station.GeoInfo.CountyName,
                temperature: station.WeatherElement.AirTemperature,
                humidity: station.WeatherElement.RelativeHumidity,
                rain: station.WeatherElement.Now.Precipitation,
                time: station.ObsTime.DateTime
            };
        } catch (error) {
            console.error('WeatherService Observation Error:', error);
            return null;
        }
    }
}
