package com.trip.app.model;

import lombok.Data;
import java.sql.Date;
import java.sql.Timestamp;

@Data
public class MemberDTO {
    private String loginId;
    private String password;
    private String name;
    private String email;
    private String phoneNumber;
    private String gender;
    private Date birth;
    private String role;
    private Timestamp createAt;

}
