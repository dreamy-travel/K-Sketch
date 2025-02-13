import React from "react";
import styles from "./style/MainContent.module.css";
import CurrentWeather from "./CurrentWeather";
import { useQueries } from "@tanstack/react-query";
import { useRecoilState } from "recoil";
import { locationState } from "../../recoil/atoms/locationState";
import WeatherApi from "../../api/WeatherApi";
import Forecast from "./Forecast";
import Highlights from "./Highlights";
import HourlyForecast from "./HourlyForecast";
import Loading from "./Loading";

export default function MainContent() {
    const [location] = useRecoilState(locationState);

    const results = useQueries({
        queries: [
            {
                queryKey: ["currentWeather", location.lat, location.lon],
                queryFn: () =>
                    location.lat && location.lon
                        ? WeatherApi.getCurrentWeather(location.lat, location.lon)
                        : Promise.reject(new Error("위치 정보 없음")),
                staleTime: 60000,
                gcTime: 1000 * 60 * 10,
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                refetchOnReconnect: false,
                enabled: !!location.lat && !!location.lon,
            },
            {
                queryKey: ["forecast", location.lat, location.lon],
                queryFn: () =>
                    location.lat && location.lon
                        ? WeatherApi.getForecast(location.lat, location.lon)
                        : Promise.reject(new Error("위치 정보 없음")),
                staleTime: 60000,
                gcTime: 1000 * 60 * 10,
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                refetchOnReconnect: false,
                enabled: !!location.lat && !!location.lon,
            },
            {
                queryKey: ["city", location.lat, location.lon],
                queryFn: () =>
                    location.lat && location.lon
                        ? WeatherApi.getReverseGeo(location.lat, location.lon)
                        : Promise.reject(new Error("위치 정보 없음")),
                staleTime: 60000,
                gcTime: 1000 * 60 * 10,
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                refetchOnReconnect: false,
                enabled: !!location.lat && !!location.lon,
            },
            {
                queryKey: ["air_pollution", location.lat, location.lon],
                queryFn: () =>
                    location.lat && location.lon
                        ? WeatherApi.getAirPollution(location.lat, location.lon)
                        : Promise.reject(new Error("위치 정보 없음")),
                staleTime: 60000,
                gcTime: 1000 * 60 * 10,
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                refetchOnReconnect: false,
                enabled: !!location.lat && !!location.lon,
            }
        ],
    });

    const [{ data: currentWeather }, { data: forecastData }, { data: city }, { data: airPollution }] = results;

    const isLoading = results[0].isLoading || results[1].isLoading || results[2].isLoading || results[3].isLoading;

    if (isLoading || !currentWeather || !forecastData || !city || !airPollution) {
        return <Loading />
    }

    return (
        <div className={styles.container}>
            <div className={styles.topSection}>
                <div className={styles.weatherLeft}>
                    <CurrentWeather currentWeather={currentWeather} city={city} />
                </div>
                <div className={styles.weatherRight}>
                    <Forecast forecastData={forecastData} />
                </div>
            </div>
            <div className={styles.bottomSection}>
                <HourlyForecast forecastData={forecastData} />
            </div>
        </div>
    );
}