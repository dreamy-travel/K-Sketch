package com.trip.app.mapper;

import com.trip.app.model.ScheduleDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface ScheduleMapper {
    int insertSchedule(ScheduleDTO scheduleDTO);
    int updateSchedule(ScheduleDTO scheduleDTO);
    List<ScheduleDTO> getUserTrips(String loginId);
    Optional<ScheduleDTO> findById(Long tripId);
}
