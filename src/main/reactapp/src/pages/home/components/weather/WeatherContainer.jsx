import React from 'react';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import Header from "../../../weather/Header";
import MainContent from "../../../weather/MainContent";
import "./WeatherContainer.style.css";

const queryClient = new QueryClient();

const WeatherContainer = () => {
    return (
        <>
            <div className="weather-title">
                <span className="weather-title-a">'K-Sketch'</span>
                <span className="weather-title-b"> 날씨 정보</span>
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '20px'
            }}>
                <QueryClientProvider client={queryClient}>
                    <Header/>
                    <MainContent/>
                </QueryClientProvider>
            </div>
        </>
    );
};

export default WeatherContainer;