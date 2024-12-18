import React, { useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import usePlaces from '../../hooks/usePlaces'; // 필요한 커스텀 훅 import 필요

// 장소 목록 아이템 컴포넌트
const PlaceListItem = ({ place, onAddClick, onRemoveClick, isSelected }) => (
    <div className="place-list-item">
        <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-3">
                {place.firstimage ? (
                    <img
                        src={place.firstimage}
                        alt={place.title}
                        className="place-image"
                    />
                ) : (
                    <div className="no-image-placeholder">
                        <small className="text-muted m-0">이미지가<br />없습니다</small>
                    </div>
                )}
                <div className="place-info">
                    <div className="fw-bold text-truncate" title={place.title}>{place.title}</div>
                    <small className="text-muted text-truncate d-block" title={place.addr1}>
                        {place.addr1}
                    </small>
                </div>
            </div>
        </div>
        <button
            className={`btn ${isSelected ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
            onClick={isSelected ? () => onRemoveClick(place) : () => onAddClick(place)}
        >
            <i className={`bi ${isSelected ? 'bi-check' : 'bi-plus'}`}></i>
        </button>
    </div>
);

// 장소 선택 컴포넌트
const PlaceSelector = ({ onAddPlace, onRemovePlace, selectedPlaces }) => {
    const [apiType, setApiType] = useState("search");
    const [inputKeyword, setInputKeyword] = useState("");
    const [keyword, setKeyword] = useState("부산");
    const [contentTypeId, setContentTypeId] = useState("12");

    const CONTENT_TYPES = [
        { id: '12', text: '관광지' },
        { id: '14', text: '문화시설' },
        { id: '15', text: '축제공연' },
        { id: '25', text: '여행코스' },
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
                            className={`btn btn-sm content-type-button ${contentTypeId === type.id
                                    ? 'btn-primary'
                                    : 'btn-outline-primary'
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
        </div>
    );
};

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
                    <div className="overflow-auto time-selector-container">
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
                    <div className="mt-3 d-flex justify-content-between">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                onDateSelect([startDate, endDate], selectedDates, true); // 완료 상태를 전달
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

// 숙박 선택 컴포넌트
const StaySelector = ({ onAddPlace, onRemovePlace, selectedPlaces }) => {
    const [apiType, setApiType] = useState("search");
    const [inputKeyword, setInputKeyword] = useState("");
    const [keyword, setKeyword] = useState("부산");
    const [contentTypeId] = useState("32"); // 숙박 시설 contentTypeId는 32로 고정
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

    if (error) return <p>숙박 시설 데이터 로드 중 오류가 발생했습니다: {error.message}</p>;
    if (isLoading) return <p>숙박 시설 데이터를 로드하는 중입니다...</p>;

    return (
        <div className="h-100 overflow-hidden">
            <div className="p-3 border-bottom">
                <div className="input-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="숙박 시설명을 입력하세요"
                        value={inputKeyword}
                        onChange={(e) => setInputKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="btn btn-primary" onClick={handleSearch}>
                        <i className="bi bi-search"></i>
                    </button>
                </div>
            </div>

            <div className="overflow-auto" style={{ height: 'calc(100% - 116px)', scrollbarWidth: 'none' }}>
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
        </div>
    );
};

// 사이드바 버튼 데이터
const STEP_BUTTONS = [
    { id: 'date', step: 1, text: '날짜 선택' },
    { id: 'place', step: 2, text: '장소 선택' },
    { id: 'stay', step: 3, text: '숙박 선택' },
    { id: 'path', step: 4, text: '길찾기 경로' }
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

// 선택된 장소 아이템 컴포넌트
const SelectedPlaceItem = ({ place, onRemove, duration, onDurationChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [hours, setHours] = useState(Math.floor(duration / 60));
    const [minutes, setMinutes] = useState(duration % 60);

    const handleTimeChange = (newHours, newMinutes) => {
        const totalMinutes = (newHours * 60) + newMinutes;
        onDurationChange(place, totalMinutes);
        setHours(newHours);
        setMinutes(newMinutes);
    };

    return (
        <div className="selected-item">
            <div className="d-flex align-items-center gap-3">
                <img
                    src={place.firstimage}
                    alt={place.title}
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
                        <div className="time-editor">
                            <div className="time-spinner">
                                <button onClick={() => handleTimeChange(hours + 1, minutes)} className="spinner-button">▲</button>
                                <input
                                    type="number"
                                    value={hours}
                                    onChange={(e) => handleTimeChange(parseInt(e.target.value) || 0, minutes)}
                                    className="time-input"
                                />
                                <button onClick={() => handleTimeChange(Math.max(0, hours - 1), minutes)} className="spinner-button">▼</button>
                            </div>
                            <span>시간</span>
                            <div className="time-spinner">
                                <button onClick={() => handleTimeChange(hours, (minutes + 30) % 60)} className="spinner-button">▲</button>
                                <input
                                    type="number"
                                    value={minutes}
                                    onChange={(e) => handleTimeChange(hours, parseInt(e.target.value) || 0)}
                                    className="time-input"
                                />
                                <button onClick={() => handleTimeChange(hours, Math.max(0, minutes - 30))} className="spinner-button">▼</button>
                            </div>
                            <span>분</span>
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

export { SelectedPlaceItem, PlaceSelector, StaySelector, DateSelector, StepButton, STEP_BUTTONS };