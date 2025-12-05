import svgPaths from "./svg-9b0n9lktz3";

function IcoCrypto() {
  return (
    <div className="overflow-clip relative shrink-0 size-[50px]" data-name="Ico/Crypto">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 50">
        <g id="Group">
          <path d={svgPaths.p19a4a080} fill="#000000" id="Vector" />
          <g id="Logo">
            <g id="Vector_2">
              <path d={svgPaths.p11668100} fill="#FFF000" />
              <path d={svgPaths.p9aaf680} fill="#FFF000" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative size-full">
      <IcoCrypto />
    </div>
  );
}