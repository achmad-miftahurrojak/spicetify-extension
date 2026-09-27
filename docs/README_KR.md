<div align="center">

# Spicetify Extensions

<a href="../README.md"><img alt="English" src="https://img.shields.io/badge/English-DFE0E5"></a> <a href="README_ID.md"><img alt="Bahasa Indonesia" src="https://img.shields.io/badge/Bahasa%20Indonesia-DFE0E5"></a> <a href="README_KR.md"><img alt="한국어" src="https://img.shields.io/badge/%ED%95%9C%EA%B5%AD%EC%96%B4-DFE0E5"></a>

<img alt="Spicetify" src="https://img.shields.io/badge/Spicetify-1DB954?logo=spotify&logoColor=white"> <img alt="License" src="https://img.shields.io/badge/License-MIT-blue.svg">

각자 설치할 수 있는 Spotify 확장 기능과 테마 모음입니다.

</div>

---

## 확장 기능

| 프로젝트 | 설명 | 문서 |
| --- | --- | --- |
| [Songwriter's Pad](../songwriters-pad/) | Spotify 안에서 timestamp가 있는 가사, 코드, 메모를 저장합니다. | [README](../songwriters-pad/README.md) |
| [Dedication](../dedication/) | 메시지와 postcard 화면으로 노래를 보냅니다. | [README](../dedication/README.md) |
| [Spiceflow](../Spiceflow/) | 가벼운 테마로 sidebar hover 효과를 추가합니다. | [README](../Spiceflow/README.md) |

각 프로젝트는 자체 source, build 안내, 설치 파일을 제공합니다.

## 요구 사항

- [Spicetify CLI](https://spicetify.app/docs/getting-started) 2.36 이상
- Spotify Desktop
- 빌드가 필요한 프로젝트는 Node.js 20+ 및 pnpm 9+

## 개발

    cd songwriters-pad
    pnpm install
    pnpm build

선택한 확장 기능 폴더의 README를 따르세요. 변경 시 bundle, manifest, 설치 script를 함께 확인하세요.

## 라이선스

[MIT](../LICENSE)

Spicetify는 Spotify client를 수정하므로 client 업데이트로 확장 기능이 동작하지 않을 수 있습니다.

