import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, Container, Row } from 'react-bootstrap';
import { useSearch } from '../../hooks/useSearch';
import { useSearchParams } from 'react-router-dom';
import TravelCard from './travelcard/TravelCard';
import axios from 'axios';

const TravelList = () => {
  const [query] = useSearchParams();
  const keyword = query.get("q");

  const { data, isLoading, isError, error } = useSearch({ keyword });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredData, setFilteredData] = useState([]);

  // 카테고리 데이터를 불러오는 함수
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://apis.data.go.kr/B551011/KorService1/areaCode1?serviceKey=yrgC%2B43SMF1XX%2Bb2wdT%2FLStUfM%2BUtudnH1zLiN40e0zQPaLsA7YUt6A1pdgBhSOE0YFbj0Q92OgugmuP9Yjcxg%3D%3D&numOfRows=20&pageNo=1&MobileOS=ETC&MobileApp=TestApp&_type=json"
      );
      setCategories(response.data.response.body.items.item);
    } catch (err) {
      console.error("카테고리 데이터 로딩 실패:", err);
    }
  };

  // 선택된 카테고리에 따라 필터링된 데이터를 불러오는 함수
  const fetchFilteredData = async (categoryCode) => {
    try {
      const response = await axios.get(
        `http://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey=yrgC%2B43SMF1XX%2Bb2wdT%2FLStUfM%2BUtudnH1zLiN40e0zQPaLsA7YUt6A1pdgBhSOE0YFbj0Q92OgugmuP9Yjcxg%3D%3D&numOfRows=100&pageNo=1&MobileOS=ETC&MobileApp=TestApp&areaCode=${categoryCode}&_type=json`
      );
      setFilteredData(response.data.response.body.items.item);
    } catch (err) {
      console.error("필터링된 데이터 로딩 실패:", err);
    }
  };

  // 컴포넌트가 렌더링될 때 카테고리 데이터를 불러옵니다
  useEffect(() => {
    fetchCategories();
  }, []);

  // 카테고리 버튼 클릭 시 필터링된 데이터 가져오기
  const handleCategoryClick = (categoryCode) => {
    setSelectedCategory(categoryCode);
    fetchFilteredData(categoryCode);
  };

  if (isLoading) {
    return <div className="bigContainer">로딩중</div>;
  }

  if (isError) {
    return <Alert variant="danger">{error.message}</Alert>;
  }

  // 데이터가 배열인지 확인하고, 없으면 빈 배열로 처리
  const travelData = Array.isArray(data) ? data : [];
  const displayData = selectedCategory ? filteredData : travelData; // 카테고리 선택 시 필터링된 데이터 사용

  return (
    <div>
      <Container>
        <Row>
          {/* 카테고리 버튼 */}
          <Col lg={3} md={6} xs={12}>
            {categories.map((category) => (
              <Button
                key={category.code}
                variant="primary"
                onClick={() => handleCategoryClick(category.code)}
                className="m-2"
              >
                {category.name}
              </Button>
            ))}
          </Col>

          {/* 여행 카드 리스트 */}
          <Col lg={9} xs={12}>
            <Row>
              {displayData.map((totravel) => (
                <Col lg={4} md={6} xs={12} key={totravel.id}>
                  <TravelCard togotravel={totravel} />
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TravelList;
