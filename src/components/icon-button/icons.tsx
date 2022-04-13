export enum Icons {
  ChevronLeft = 'chevron-left',
  ChevronRight = 'chevron-right',
  Sun = 'sun',
  Moon = 'moon',
}

const icons = {
  [Icons.ChevronLeft]: (
    <path d="M0.645583 5.70699L4.71399 9.77539C4.96195 10.0234 5.36398 10.0234 5.61195 9.77539C5.85991 9.52743 5.85991 9.12539 5.61195 8.87743L1.72856 4.99405L5.61194 1.11068C5.85943 0.863183 5.85812 0.461513 5.60901 0.215643C5.3622 -0.027966 4.96503 -0.0266684 4.71981 0.218548L0.645583 4.29277C0.255059 4.6833 0.255059 5.31646 0.645583 5.70699Z" />
  ),
  [Icons.ChevronRight]: (
    <path d="M5.35442 5.70699L1.28601 9.77539C1.03805 10.0234 0.636018 10.0234 0.388053 9.77539C0.140089 9.52743 0.14009 9.12539 0.388054 8.87743L4.27144 4.99405L0.388063 1.11068C0.14057 0.863183 0.141882 0.461513 0.390988 0.215643C0.637802 -0.027966 1.03497 -0.0266684 1.28019 0.218548L5.35442 4.29277C5.74494 4.6833 5.74494 5.31646 5.35442 5.70699Z" />
  ),
  [Icons.Sun]: (
    <>
    <g filter="url(#filter0_d_2287_10517)">
    <path d="M18.0003 21.3337C19.8413 21.3337 21.3337 19.8413 21.3337 18.0003C21.3337 16.1594 19.8413 14.667 18.0003 14.667C16.1594 14.667 14.667 16.1594 14.667 18.0003C14.667 19.8413 16.1594 21.3337 18.0003 21.3337Z" fill="#9D9D9D" stroke="#CECECE" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M18 10.667V12.0003" stroke="#CECECE" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M18 24V25.3333" stroke="#CECECE" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12.8135 12.8135L13.7601 13.7601" stroke="#CECECE" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M22.2402 22.2402L23.1869 23.1869" stroke="#CECECE" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10.667 18H12.0003" stroke="#CECECE" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M24 18H25.3333" stroke="#CECECE" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12.8135 23.1869L13.7601 22.2402" stroke="#CECECE" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M22.2402 13.7601L23.1869 12.8135" stroke="#CECECE" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <defs>
    <filter id="filter0_d_2287_10517" x="0" y="0" width="36" height="36" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
    <feOffset/>
    <feGaussianBlur stdDeviation="5"/>
    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.7 0"/>
    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2287_10517"/>
    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2287_10517" result="shape"/>
    </filter>
    </defs>
    </>
  ),
  [Icons.Moon]: (
    <path d="M20.9999 12.79C20.8426 14.4922 20.2038 16.1144 19.1581 17.4668C18.1125 18.8192 16.7034 19.8458 15.0956 20.4265C13.4878 21.0073 11.7479 21.1181 10.0794 20.7461C8.41092 20.3741 6.8829 19.5345 5.67413 18.3258C4.46536 17.117 3.62584 15.589 3.25381 13.9205C2.88178 12.252 2.99262 10.5121 3.57336 8.9043C4.15411 7.29651 5.18073 5.88737 6.53311 4.84175C7.8855 3.79614 9.5077 3.15731 11.2099 3C10.2133 4.34827 9.73375 6.00945 9.85843 7.68141C9.98312 9.35338 10.7038 10.9251 11.8893 12.1106C13.0748 13.2961 14.6465 14.0168 16.3185 14.1415C17.9905 14.2662 19.6516 13.7866 20.9999 12.79Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  ),
};

export const getIcon = (icon: Icons) => icons[icon];
