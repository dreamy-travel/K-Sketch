package com.trip.app.controller;

import com.trip.app.model.MemberDTO;
import com.trip.app.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MemberController {

    @Autowired
    private MemberService memberService;

    @PostMapping("/api/join")
    public int joinMember(@RequestBody MemberDTO memberDTO) {
        System.out.println("여기까지 보자: " + memberDTO);
        // 회원가입 처리 후 성공/실패 값 반환
        return memberService.regist(memberDTO);
    }

    // 아이디 중복 확인 처리
    @PostMapping("/api/check-duplicate-id")
    public int checkDuplicateId(@RequestBody MemberDTO memberDTO) {
        // 아이디 중복 여부 체크
        return memberService.checkDuplicateId(memberDTO.getLoginId());
    }

    //  이메일 중복 확인 처리
    @PostMapping("/api/check-duplicate-email")
    public int checkDuplicateEmail(@RequestBody MemberDTO memberDTO) {
        // 이메일 중복 여부 체크
        return memberService.checkDuplicateEmail(memberDTO.getEmail());
    }

    //  이메일로 아이디 찾기
    @PostMapping("/api/search-id-email")
    public MemberDTO searchIdByEmailAndName(@RequestBody MemberDTO memberDTO) {
        MemberDTO foundMember = memberService.findIdByNameAndEmail(memberDTO.getName(), memberDTO.getEmail());
        if (foundMember != null) {
            return foundMember;  // 아이디와 생성일자 반환
        } else {
            return null;  // 아이디를 찾지 못한 경우
        }
    }

    //  이메일로 비밀번호 찾기
    @PostMapping("/api/search-pw-email")
    public MemberDTO searchPwByEmailAndId(@RequestBody MemberDTO memberDTO) {
        MemberDTO foundMember = memberService.findPwByIdAndEmail(memberDTO.getLoginId(), memberDTO.getEmail());
        if (foundMember != null) {
            return foundMember;
        } else {
            return null;
        }
    }

    // 비밀번호 재설정
    @PostMapping("/api/pw-change")
    public String changePassword(@RequestBody MemberDTO memberDTO) {
        boolean isUpdated = memberService.updatePassword(memberDTO);
        if (isUpdated) {
            return "비밀번호가 성공적으로 변경되었습니다.";
        } else {
            return "비밀번호 변경에 실패했습니다. 입력한 정보를 확인해주세요.";
        }
    }
}