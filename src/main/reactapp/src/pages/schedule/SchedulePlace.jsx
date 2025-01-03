import React, { useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import usePlaces from '../../hooks/usePlaces'; // 필요한 커스텀 훅 import 필요
import logoImage from '../../logoimage.png';
import './scss/SchedulePlace.scss';

// 날짜 선택 컴포넌트
const DateSelector = ({ onDateSelect }) => {
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    const [showTimeSelector, setShowTimeSelector] = useState(false);
    const [selectedDates, setSelectedDates] = useState([]);

    const handleDateChange = (update) => {
        const [start, end] = update;
        if (start && end) {
            const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            if (diffDays > 10) {
                alert('최대 10일까지만 선택 가능합니다.');
                return;
            }
        }
        setDateRange(update);
    };

    const handleConfirmDates = () => {
        if (startDate && endDate) {
            const dates = [];
            let currentDate = new Date(startDate);

            while (currentDate <= endDate) {
                dates.push({
                    date: new Date(currentDate),
                    startTime: "10:00",
                    endTime: "22:00"
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
            setSelectedDates(dates);
            setShowTimeSelector(true);
            onDateSelect([startDate, endDate], dates);
        }
    };

    const handleTimeChange = (index, type, value) => {
        const updatedDates = [...selectedDates];
        updatedDates[index] = {
            ...updatedDates[index],
            [type]: value
        };

        // 시작 시간이 종료 시간보다 늦은 경우 종료 시간을 자동으로 조정
        if (type === 'startTime') {
            const startHour = parseInt(value.split(':')[0]);
            const endHour = parseInt(updatedDates[index].endTime.split(':')[0]);

            if (startHour >= endHour) {
                updatedDates[index].endTime = `${(startHour + 1).toString().padStart(2, '0')}:00`;
            }
        }
        // 종료 시간이 시작 시간보다 이른 경우 시작 시간을 자동으로 조정
        else if (type === 'endTime') {
            const startHour = parseInt(updatedDates[index].startTime.split(':')[0]);
            const endHour = parseInt(value.split(':')[0]);

            if (endHour <= startHour) {
                updatedDates[index].startTime = `${(endHour - 1).toString().padStart(2, '0')}:00`;
            }
        }

        setSelectedDates(updatedDates);
    };

    // 헤더용 날짜 포맷
    const formatHeaderDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const weekday = date.toLocaleDateString('ko-KR', { weekday: 'short' });
        return `${year}.${month}.${day} (${weekday})`;
    };

    // 일자별 날짜 포맷 (기존 그대로 유지)
    const formatDateKorean = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const weekday = date.toLocaleDateString('ko-KR', { weekday: 'short' });
        return `${month}.${day} (${weekday})`;
    };

    const formatTime = (hour) => {
        const ampm = hour < 12 ? '오전' : '오후';
        const displayHour = hour < 12 ? hour : hour === 12 ? hour : hour - 12;
        return `${ampm} ${String(displayHour).padStart(2, '0')}:00`;
    };

    return (
        <div className="h-100 overflow-hidden">
            {!showTimeSelector ? (
                <div>
                    <h5 className="mb-3">언제가세요?</h5>
                    <p className="text-primary small mb-4">
                        <i className="bi bi-info-circle me-2"></i>
                        현재 10일까지 선택 가능
                    </p>

                    <DatePicker
                        selected={startDate}
                        onChange={handleDateChange}
                        startDate={startDate}
                        endDate={endDate}
                        selectsRange
                        inline
                        monthsShown={1}
                        locale={ko}
                        dateFormat="yyyy년 MM월 dd일"
                        minDate={new Date()}
                        className="form-control"
                        calendarClassName="border-0"
                        wrapperClassName="w-100"
                        showMonthYearDropdown
                        renderCustomHeader={({
                            date,
                            decreaseMonth,
                            increaseMonth,
                            prevMonthButtonDisabled,
                            nextMonthButtonDisabled
                        }) => (
                            <div className="d-flex justify-content-between align-items-center px-2 py-2">
                                <button
                                    onClick={decreaseMonth}
                                    disabled={prevMonthButtonDisabled}
                                    type="button"
                                    className="btn btn-link text-dark p-0"
                                >
                                    <i className="bi bi-chevron-left"></i>
                                </button>
                                <span className="fw-bold">
                                    {date.getFullYear()}년 {date.getMonth() + 1}월
                                </span>
                                <button
                                    onClick={increaseMonth}
                                    disabled={nextMonthButtonDisabled}
                                    type="button"
                                    className="btn btn-link text-dark p-0"
                                >
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            </div>
                        )}
                    />

                    {startDate && endDate && (
                        <div className="mt-4">
                            <div className="d-flex justify-content-between mb-3">
                                <div>
                                    <small className="text-muted d-block">가는날</small>
                                    <span className="text-primary fw-bold">
                                        {startDate.toLocaleDateString('ko-KR', {
                                            month: '2-digit',
                                            day: '2-digit',
                                            weekday: 'short'
                                        })}
                                    </span>
                                </div>
                                <div>
                                    <small className="text-muted d-block">오는날</small>
                                    <span className="text-primary fw-bold">
                                        {endDate.toLocaleDateString('ko-KR', {
                                            month: '2-digit',
                                            day: '2-digit',
                                            weekday: 'short'
                                        })}
                                    </span>
                                </div>
                                <div className="text-primary fw-bold">
                                    {Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24))}박
                                    {Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24) + 1)}일
                                </div>
                            </div>
                            <button
                                className="btn btn-primary w-100"
                                onClick={handleConfirmDates}
                            >
                                시간 설정하기
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <div className="d-flex align-items-center justify-content-between mb-3 p-3 border-bottom">
                        <h6 className="m-0">
                            {formatHeaderDate(startDate)} - {formatHeaderDate(endDate)}
                        </h6>
                        <button
                            className="btn btn-link text-primary p-0"
                            onClick={() => setShowTimeSelector(false)}
                        >
                            <i className="bi bi-calendar3 fs-5"></i>
                        </button>
                    </div>
                    <div className="time-selector-container">
                        {selectedDates.map((dateInfo, index) => (
                            <div key={index} className="border-bottom">
                                <div className="d-flex align-items-center py-3">
                                    <div className="date-cell">
                                        <div className="text-muted small">일자</div>
                                        <div className="fw-medium date-text">
                                            {formatDateKorean(dateInfo.date)}
                                        </div>
                                    </div>

                                    <div className="time-cell">
                                        <div className="text-muted small">시작시간</div>
                                        <select
                                            className="form-select form-select-sm border-0 p-0 time-select"
                                            value={dateInfo.startTime}
                                            onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                                        >
                                            {Array.from({ length: 24 }, (_, i) => {
                                                const timeValue = `${String(i).padStart(2, '0')}:00`;
                                                return (
                                                    <option key={i} value={timeValue}>
                                                        {formatTime(i)}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>

                                    <div className="arrow-cell d-flex align-items-end mb-1">
                                        <span>→</span>
                                    </div>

                                    <div className="time-cell">
                                        <div className="text-muted small">종료시간</div>
                                        <select
                                            className="form-select form-select-sm border-0 p-0 time-select"
                                            value={dateInfo.endTime}
                                            onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                                        >
                                            {Array.from({ length: 24 }, (_, i) => {
                                                const timeValue = `${String(i).padStart(2, '0')}:00`;
                                                return (
                                                    <option key={i} value={timeValue}>
                                                        {formatTime(i)}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="time-selector-actions">
                        <button
                            className="btn btn-primary w-100"
                            onClick={() => {
                                onDateSelect([startDate, endDate], selectedDates, true);
                            }}
                        >
                            시간 설정 완료
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// 장소 목록 아이템 컴포넌트
const PlaceListItem = ({ place, onAddClick, onRemoveClick, isSelected }) => (
    <div className="poi-result">
        <div className="poi-info">
            <div className="info-container">
                {place.firstimage ? (
                    <img
                        src={place.firstimage}
                        alt={place.title}
                        className="place-image cover"
                    />
                ) : (
                    <img
                        src={logoImage}
                        alt="기본 이미지"
                        className="place-image contain"
                    />
                )}
                <div className="text-container">
                    <div className="poi-title" title={place.title}>
                        {place.title}
                    </div>
                    <div className="poi-address" title={place.addr1}>
                        {place.addr1}
                    </div>
                </div>
            </div>
        </div>
        <button
            className={`btn ${isSelected ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
            onClick={() => isSelected ? onRemoveClick(place) : onAddClick(place)}
        >
            <i className={`bi ${isSelected ? 'bi-check' : 'bi-plus'}`}></i>
        </button>
    </div>
);

// 장소 선택 컴포넌트
const PlaceSelector = ({ onAddPlace, onRemovePlace, selectedPlaces }) => {
    const [activeTab, setActiveTab] = useState('existing'); // 'existing' 또는 'new'
    const [apiType, setApiType] = useState("search");
    const [inputKeyword, setInputKeyword] = useState("");
    const [keyword, setKeyword] = useState("부산");
    const [contentTypeId, setContentTypeId] = useState("12");

    const CONTENT_TYPES = [
        { id: '12', text: '관광지' },
        { id: '14', text: '문화시설' },
        { id: '15', text: '축제공연' },
        { id: '28', text: '레포츠' },
        { id: '38', text: '쇼핑' },
        { id: '39', text: '음식점' }
    ];

    const { places, error, isLoading } = usePlaces(apiType, keyword, contentTypeId);

    const handleAddPlace = useCallback((place) => {
        if (!selectedPlaces.some(p => p.title === place.title)) {
            onAddPlace(place);
        }
    }, [selectedPlaces, onAddPlace]);

    const handleRemovePlace = useCallback((place) => {
        onRemovePlace(place);
    }, [onRemovePlace]);

    const handleSearch = () => {
        setKeyword(inputKeyword);
    };

    if (error) return <p>장소 데이터 로드 중 오류가 발생했습니다: {error.message}</p>;
    if (isLoading) return <p>장소 데이터를 로드하는 중입니다...</p>;

    return (
        <div className="h-100 overflow-hidden">
            <div className="search-tabs">
                <button 
                    className={`tab-button ${activeTab === 'existing' ? 'active' : ''}`}
                    onClick={() => setActiveTab('existing')}
                >
                    장소 선택
                </button>
                <button 
                    className={`tab-button ${activeTab === 'new' ? 'active' : ''}`}
                    onClick={() => setActiveTab('new')}
                >
                    신규 장소 등록
                </button>
            </div>

            {activeTab === 'existing' ? (
                <>
                    <div className="p-3 border-bottom">
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="장소명을 입력하세요"
                                value={inputKeyword}
                                onChange={(e) => setInputKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button className="btn btn-primary" onClick={handleSearch}>
                                <i className="bi bi-search"></i>
                            </button>
                        </div>

                        <div className="content-type-buttons">
                            {CONTENT_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setContentTypeId(type.id)}
                                    className={`btn btn-sm content-type-button ${
                                        contentTypeId === type.id ? 'btn-primary' : 'btn-outline-primary'
                                    }`}
                                >
                                    {type.text}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-auto" style={{ height: 'calc(100% - 150px)', scrollbarWidth: 'none' }}>
                        {places.map((place, index) => (
                            <PlaceListItem
                                key={index}
                                place={place}
                                onAddClick={handleAddPlace}
                                onRemoveClick={handleRemovePlace}
                                isSelected={selectedPlaces.some(p => p.title === place.title)}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <PoiSearchTab 
                    onAddPlace={handleAddPlace} 
                    selectedPlaces={selectedPlaces}
                />
            )}
        </div>
    );
};

// POI 검색 탭 컴포넌트
const PoiSearchTab = ({ onAddPlace, selectedPlaces }) => {
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 장소가 이미 선택되었는지 확인하는 함수
    const isPlaceSelected = (place) => {
        return selectedPlaces.some(p => 
            p.title === place.title && 
            p.addr1 === place.addr1
        );
    };

    const searchPOI = async (searchKeyword) => {
        if (!searchKeyword) return;
        
        setIsLoading(true);
        const headers = {
            appKey: process.env.REACT_APP_TMAP_KEY
        };

        try {
            const response = await fetch(
                `https://apis.openapi.sk.com/tmap/pois?${new URLSearchParams({
                    version: 1,
                    format: 'json',
                    searchKeyword: searchKeyword,
                    resCoordType: 'WGS84GEO',
                    reqCoordType: 'WGS84GEO',
                    count: 20
                })}`,
                { headers }
            );
            const data = await response.json();

            if (data.searchPoiInfo?.pois?.poi) {
                const results = data.searchPoiInfo.pois.poi.map(poi => ({
                    title: poi.name,
                    addr1: `${poi.upperAddrName} ${poi.middleAddrName} ${poi.lowerAddrName}`,
                    mapx: poi.noorLon,
                    mapy: poi.noorLat,
                    firstimage: null
                }));
                setSearchResults(results);
            }
        } catch (error) {
            console.error('POI 검색 오류:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        searchPOI(keyword);
    };

    return (
        <div className="p-3">
            <div className="input-group mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="장소명 또는 주소를 입력하세요"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                    className="btn btn-primary" 
                    onClick={handleSearch}
                    disabled={isLoading}
                >
                    <i className="bi bi-search"></i>
                </button>
            </div>

            <div className="overflow-auto" style={{ height: 'calc(100% - 70px)' }}>
                {isLoading ? (
                    <div className="text-center p-3">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">검색중...</span>
                        </div>
                    </div>
                ) : (
                    searchResults.map((result, index) => (
                        <div key={index} className="poi-result">
                            <div className="poi-info">
                                <div className="info-container">
                                    <img
                                        src={logoImage}
                                        alt="기본 이미지"
                                        className="place-image contain"
                                    />
                                    <div className="text-container">
                                        <div className="poi-title" title={result.title}>
                                            {result.title}
                                        </div>
                                        <div className="poi-address" title={result.addr1}>
                                            {result.addr1}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                className={`btn ${isPlaceSelected(result) ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                                onClick={() => onAddPlace(result)}
                                disabled={isPlaceSelected(result)}
                            >
                                <i className={`bi ${isPlaceSelected(result) ? 'bi-check' : 'bi-plus'}`}></i>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// 선택된 장소 아이템 컴포넌트
const SelectedPlaceItem = ({ place, onRemove, duration, onDurationChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [hours, setHours] = useState(Math.floor(duration / 60));
    const [minutes, setMinutes] = useState(duration % 60);
    const [tempHours, setTempHours] = useState(hours);
    const [tempMinutes, setTempMinutes] = useState(minutes);

    const handleTimeChange = (newHours, newMinutes) => {
        setTempHours(newHours);
        setTempMinutes(newMinutes);
    };

    const handleConfirm = () => {
        const totalMinutes = (tempHours * 60) + tempMinutes;
        onDurationChange(place, totalMinutes);
        setHours(tempHours);
        setMinutes(tempMinutes);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempHours(hours);
        setTempMinutes(minutes);
        setIsEditing(false);
    };

    return (
        <div className="selected-item">
            <div className="d-flex align-items-center gap-3">
                <img
                    src={place.firstimage || logoImage}
                    alt={place.firstimage ? place.title : "기본 이미지"}
                    className="selected-item-image"
                />
                <div className="selected-item-content">
                    <div className="fw-bold text-truncate" title={place.title}>
                        {place.title}
                    </div>
                    <small className="text-muted text-truncate d-block" title={place.addr1 || '주소 정보가 없습니다'}>
                        {place.addr1 || '주소 정보가 없습니다'}
                    </small>
                </div>
                <div className="duration-controls">
                    {isEditing ? (
                        <div className="d-flex align-items-center gap-2">
                            <div className="time-editor">
                                <div className="time-spinner">
                                    <button onClick={() => handleTimeChange(tempHours + 1, tempMinutes)} className="spinner-button">▲</button>
                                    <input
                                        type="number"
                                        value={tempHours}
                                        onChange={(e) => handleTimeChange(parseInt(e.target.value) || 0, tempMinutes)}
                                        className="time-input"
                                    />
                                    <button onClick={() => handleTimeChange(Math.max(0, tempHours - 1), tempMinutes)} className="spinner-button">▼</button>
                                </div>
                                <span>시간</span>
                                <div className="time-spinner">
                                    <button onClick={() => handleTimeChange(tempHours, (tempMinutes + 30) % 60)} className="spinner-button">▲</button>
                                    <input
                                        type="number"
                                        value={tempMinutes}
                                        onChange={(e) => handleTimeChange(tempHours, parseInt(e.target.value) || 0)}
                                        className="time-input"
                                    />
                                    <button onClick={() => handleTimeChange(tempHours, Math.max(0, tempMinutes - 30))} className="spinner-button">▼</button>
                                </div>
                                <span>분</span>
                            </div>
                            <div className="d-flex gap-1">
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={handleConfirm}
                                >
                                    <i className="bi bi-check"></i>
                                </button>
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={handleCancel}
                                >
                                    <i className="bi bi-x"></i>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            className="btn btn-sm btn-outline-secondary duration-button"
                            onClick={() => setIsEditing(true)}
                        >
                            {hours}시간 {minutes > 0 ? `${minutes}분` : ''}
                        </button>
                    )}
                </div>
                <button
                    className="btn btn-sm btn-outline-danger flex-shrink-0"
                    onClick={() => onRemove(place)}
                >
                    <i className="bi bi-trash"></i>
                </button>
            </div>
        </div>
    );
};

// 숙박 선택 컴포넌트
const StaySelector = ({ onAddPlace, onRemovePlace, selectedPlaces: selectedStays, selectedTimes }) => {
    const [activeTab, setActiveTab] = useState('existing');
    const [apiType, setApiType] = useState("search");
    const [inputKeyword, setInputKeyword] = useState("");
    const [keyword, setKeyword] = useState("부산");
    const [showDateModal, setShowDateModal] = useState(false);
    const [selectedStay, setSelectedStay] = useState(null);

    const { places: stays, error, isLoading } = usePlaces(apiType, keyword, "32");

    const handleSearch = () => {
        setKeyword(inputKeyword);
    };

    const handleStaySelect = (stay) => {
        setSelectedStay(stay);
        setShowDateModal(true);
    };

    const handleDateConfirm = (stay, selectedDates) => {
        const newStay = {
            ...stay,
            selectedDates: selectedDates
        };
        onAddPlace(newStay);
        setShowDateModal(false);
        setSelectedStay(null);
    };

    return (
        <div className="h-100 overflow-hidden">
            <div className="search-tabs">
                <button 
                    className={`tab-button ${activeTab === 'existing' ? 'active' : ''}`}
                    onClick={() => setActiveTab('existing')}
                >
                    숙소 선택
                </button>
                <button 
                    className={`tab-button ${activeTab === 'new' ? 'active' : ''}`}
                    onClick={() => setActiveTab('new')}
                >
                    신규 숙소 등록
                </button>
            </div>

            {activeTab === 'existing' ? (
                <>
                    <div className="p-3 border-bottom">
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="숙소명을 입력하세요"
                                value={inputKeyword}
                                onChange={(e) => setInputKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button className="btn btn-primary" onClick={handleSearch}>
                                <i className="bi bi-search"></i>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-auto" style={{ height: 'calc(100% - 150px)', scrollbarWidth: 'none' }}>
                        {stays.map((stay, index) => (
                            <div key={index} className="poi-result">
                                <div className="poi-info">
                                    <div className="info-container">
                                        {stay.firstimage ? (
                                            <img
                                                src={stay.firstimage}
                                                alt={stay.title}
                                                className="place-image cover"
                                            />
                                        ) : (
                                            <img
                                                src={logoImage}
                                                alt="기본 이미지"
                                                className="place-image contain"
                                            />
                                        )}
                                        <div className="text-container">
                                            <div className="poi-title" title={stay.title}>
                                                {stay.title}
                                            </div>
                                            <div className="poi-address" title={stay.addr1}>
                                                {stay.addr1}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => handleStaySelect(stay)}
                                >
                                    <i className="bi bi-plus"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <StayPoiSearchTab 
                    onStaySelect={handleStaySelect} 
                    selectedStays={selectedStays}
                    selectedTimes={selectedTimes}
                />
            )}

            {showDateModal && selectedStay && (
                <StayDateModal
                    stay={selectedStay}
                    selectedTimes={selectedTimes}
                    reservedDates={selectedStays.reduce((dates, stay) => 
                        [...dates, ...(stay.selectedDates || [])], [])}
                    onConfirm={handleDateConfirm}
                    onClose={() => {
                        setShowDateModal(false);
                        setSelectedStay(null);
                    }}
                />
            )}
        </div>
    );
};

// 숙소 POI 검색 탭 컴포넌트
const StayPoiSearchTab = ({ onStaySelect, selectedStays }) => {
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 숙소가 이미 선택되었는지 확인하는 함수
    const isStaySelected = (stay) => {
        return selectedStays.some(s => 
            s.title === stay.title && 
            s.addr1 === stay.addr1
        );
    };

    const searchPOI = async (searchKeyword) => {
        if (!searchKeyword) return;
        
        setIsLoading(true);
        const headers = {
            appKey: process.env.REACT_APP_TMAP_KEY
        };

        try {
            const response = await fetch(
                `https://apis.openapi.sk.com/tmap/pois?${new URLSearchParams({
                    version: 1,
                    format: 'json',
                    searchKeyword: searchKeyword,
                    resCoordType: 'WGS84GEO',
                    reqCoordType: 'WGS84GEO',
                    count: 20,
                    searchType: 'all',
                    multiPoint: 'N',
                    categoryCode: '숙박'  // 숙박 시설 카테고리로 필터링
                })}`,
                { headers }
            );
            const data = await response.json();

            if (data.searchPoiInfo?.pois?.poi) {
                const results = data.searchPoiInfo.pois.poi.map(poi => ({
                    title: poi.name,
                    addr1: `${poi.upperAddrName} ${poi.middleAddrName} ${poi.lowerAddrName}`,
                    mapx: poi.noorLon,
                    mapy: poi.noorLat,
                    firstimage: null  // POI API에서는 이미지를 제공하지 않음
                }));
                setSearchResults(results);
            }
        } catch (error) {
            console.error('POI 검색 오류:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        searchPOI(keyword);
    };

    return (
        <div className="p-3">
            <div className="input-group mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="숙소명 또는 주소를 입력하세요"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                    className="btn btn-primary" 
                    onClick={handleSearch}
                    disabled={isLoading}
                >
                    <i className="bi bi-search"></i>
                </button>
            </div>

            <div className="overflow-auto" style={{ height: 'calc(100% - 70px)' }}>
                {isLoading ? (
                    <div className="text-center p-3">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">검색중...</span>
                        </div>
                    </div>
                ) : (
                    searchResults.map((result, index) => (
                        <div key={index} className="poi-result">
                            <div className="poi-info">
                                <div className="info-container">
                                    <img
                                        src={logoImage}
                                        alt="기본 이미지"
                                        className="place-image contain"
                                    />
                                    <div className="text-container">
                                        <div className="poi-title" title={result.title}>
                                            {result.title}
                                        </div>
                                        <div className="poi-address" title={result.addr1}>
                                            {result.addr1}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                className={`btn ${isStaySelected(result) ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                                onClick={() => onStaySelect(result)}
                                disabled={isStaySelected(result)}
                            >
                                <i className={`bi ${isStaySelected(result) ? 'bi-check' : 'bi-plus'}`}></i>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// StayDateModal 컴포넌트
const StayDateModal = ({ stay, selectedTimes, reservedDates, onConfirm, onClose }) => {
    const [selectedDates, setSelectedDates] = useState([]);

    // 날짜 포맷팅 (yy.mm 형식)
    const formatDateShort = (date) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}.${day}`;
    };

    // 날짜가 이미 예약되었는지 확인
    const isDateReserved = (date) => {
        return reservedDates.some(reservedDate =>
            reservedDate.getTime() === date.getTime()
        );
    };

    const handleDateToggle = (date) => {
        if (isDateReserved(date)) return; // 미 예약된 날짜는 선택 불가

        setSelectedDates(prev => {
            if (prev.includes(date)) {
                return prev.filter(d => d !== date);
            } else {
                return [...prev, date].sort((a, b) => a - b);
            }
        });
    };

    // 이미 선택된 날짜인지 확인
    const isDateSelected = (date) => {
        return selectedDates.some(selectedDate =>
            selectedDate.getTime() === date.getTime()
        );
    };

    // 전체 선택 처리 함수 추가
    const handleSelectAll = () => {
        // 예약되지 않은 날짜들만 필터링하여 전체 선택
        const availableDates = selectedTimes
            .slice(0, -1)
            .map(timeInfo => timeInfo.date)
            .filter(date => !isDateReserved(date));

        setSelectedDates(availableDates);
    };

    return (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header border-0">
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body px-4">
                        <h5 className="text-center mb-3">숙박하실 날짜를 선택해주세요.</h5>
                        <p className="text-muted text-center small mb-4">
                            *동일한 숙소에서 연박도 남은 날짜를 선택하여 가능합니다.
                        </p>

                        <div className="text-center mb-4">
                            <h6>{stay.title}</h6>
                            <p className="text-muted small">{stay.addr1}</p>
                        </div>

                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                            {selectedTimes.slice(0, -1).map((timeInfo, index) => {
                                const isReserved = isDateReserved(timeInfo.date);
                                return (
                                    <div
                                        key={index}
                                        onClick={() => !isReserved && handleDateToggle(timeInfo.date)}
                                        className={`date-select-button ${isDateSelected(timeInfo.date) ? 'selected' : ''
                                            } ${isReserved ? 'disabled' : ''}`}
                                        style={{
                                            cursor: isReserved ? 'not-allowed' : 'pointer',
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            border: '1px solid #ddd',
                                            backgroundColor: isReserved
                                                ? '#f8f9fa'
                                                : isDateSelected(timeInfo.date)
                                                    ? '#5D2FFF'
                                                    : 'white',
                                            color: isReserved
                                                ? '#adb5bd'
                                                : isDateSelected(timeInfo.date)
                                                    ? 'white'
                                                    : 'black',
                                            minWidth: '80px',
                                            textAlign: 'center',
                                            opacity: isReserved ? 0.7 : 1
                                        }}
                                    >
                                        {formatDateShort(timeInfo.date)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="modal-footer flex-column border-0 px-4 pb-4">
                        <button
                            className="btn btn-primary w-100 py-2"
                            onClick={() => onConfirm(stay, selectedDates)}
                            disabled={selectedDates.length === 0}
                        >
                            선택 완료
                        </button>
                        <button
                            className="btn btn-outline-primary w-100 py-2 mt-2"
                            onClick={handleSelectAll}
                        >
                            전체 선택
                        </button>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show"></div>
        </div>
    );
};

// 선택된 숙박 아이템 컴포넌트
const SelectedStayItem = ({ stay, selectedTimes, selectedStays, onDateChange, onRemove }) => {
    // 날짜 포맷팅
    const formatDate = (date) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const endDate = new Date(date);
        endDate.setDate(date.getDate() + 1);
        const endDay = endDate.getDate();

        return `${month}.${day}(${getDayOfWeek(date)})-${month}.${endDay}(${getDayOfWeek(endDate)})`;
    };

    // 요일 반환
    const getDayOfWeek = (date) => {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return days[date.getDay()];
    };

    // 선택된 날짜들만 표시
    const selectedDates = stay.selectedDates || [];

    return (
        <div className="selected-stays-container">
            {selectedDates.map((date, index) => (
                <div key={index} className="stay-date-item p-3 border-bottom">
                    <div className="d-flex align-items-center gap-3">
                        <div className="stay-number rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                            style={{ width: '24px', height: '24px', minWidth: '24px' }}>
                            {index + 1}
                        </div>
                        {stay.firstimage ? (
                            <img
                                src={stay.firstimage}
                                alt={stay.title}
                                className="stay-thumbnail"
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    objectFit: 'cover',
                                    borderRadius: '4px'
                                }}
                            />
                        ) : (
                            <img
                                src={logoImage}
                                alt="기본 이미지"
                                className="stay-thumbnail"
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    objectFit: 'contain',
                                    borderRadius: '4px'
                                }}
                            />
                        )}
                        <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 0 }}>
                            <div className="text-muted small">{formatDate(date)}</div>
                            <div className="fw-bold text-truncate" title={stay.title}>{stay.title}</div>
                        </div>
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => onRemove(stay)}
                            style={{ padding: '4px 8px' }}
                        >
                            <i className="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

// 사이드바 버튼 데이터
const STEP_BUTTONS = [
    { id: 'date', step: 1, text: '날짜 선택' },
    { id: 'place', step: 2, text: '장소 선택' },
    { id: 'stay', step: 3, text: '숙박 선택' },
    // { id: 'path', step: 4, text: '길찾기 경로' }
];

// 사이드바 버튼 컴포넌트
const StepButton = ({ id, step, text, currentStep, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`sidebar-button btn border-0 p-3 rounded-3 ${currentStep === id
            ? 'text-primary fw-bold bg-primary bg-opacity-10'
            : 'text-secondary bg-light'
            }`}
    >
        <div className="sidebar-button-text">
            STEP {step}<br />{text}
        </div>
    </button>
);

export { SelectedPlaceItem, SelectedStayItem, PlaceSelector, StaySelector, DateSelector, StepButton, STEP_BUTTONS };