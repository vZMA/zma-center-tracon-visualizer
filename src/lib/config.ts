import { BaseMap, CenterAreaDefinition, MapStyle, TraconAreaPolys, TraconPolyDefinition } from '~/lib/types';
import { DEFAULT_MAP_STYLE } from '~/lib/defaults';

export const NAVDATA_API_URL = 'https://navdata.zmaartcc.org';

// ZMA center sectors
import atl01 from '~/polys/center/atl/ATL-01.geojson';
import atl02 from '~/polys/center/atl/ATL-02.geojson';
import atl17 from '~/polys/center/atl/ATL-17.geojson';
import atl18 from '~/polys/center/atl/ATL-18.geojson';
import atl19 from '~/polys/center/atl/ATL-19.geojson';
import atl21 from '~/polys/center/atl/ATL-21.geojson';
import car40 from '~/polys/center/car/CAR-40.geojson';
import car41 from '~/polys/center/car/CAR-41.geojson';
import car42 from '~/polys/center/car/CAR-42.geojson';
import car44 from '~/polys/center/car/CAR-44.geojson';
import car61 from '~/polys/center/car/CAR-61.geojson';
import cst04 from '~/polys/center/cst/CST-04.geojson';
import cst20 from '~/polys/center/cst/CST-20.geojson';
import cst22 from '~/polys/center/cst/CST-22.geojson';
import cst23 from '~/polys/center/cst/CST-23.geojson';
import evg46 from '~/polys/center/evg/EVG-46.geojson';
import evg47 from '~/polys/center/evg/EVG-47.geojson';
import evg64 from '~/polys/center/evg/EVG-64.geojson';
import evg65 from '~/polys/center/evg/EVG-65.geojson';
import evg66 from '~/polys/center/evg/EVG-66.geojson';
import evg67 from '~/polys/center/evg/EVG-67.geojson';
import evg68 from '~/polys/center/evg/EVG-68.geojson';
import ocn43 from '~/polys/center/ocn/OCN-43.geojson';
import ocn58 from '~/polys/center/ocn/OCN-58.geojson';
import ocn59 from '~/polys/center/ocn/OCN-59.geojson';
import ocn60 from '~/polys/center/ocn/OCN-60.geojson';
import ocn62 from '~/polys/center/ocn/OCN-62.geojson';
import ocn63 from '~/polys/center/ocn/OCN-63.geojson';
import wsc05 from '~/polys/center/wsc/WSC-05.geojson';
import wsc06 from '~/polys/center/wsc/WSC-06.geojson';
import wsc07 from '~/polys/center/wsc/WSC-07.geojson';
import wsc08 from '~/polys/center/wsc/WSC-08.geojson';
import wsc24 from '~/polys/center/wsc/WSC-24.geojson';
import wsc25 from '~/polys/center/wsc/WSC-25.geojson';
import wsc89 from '~/polys/center/wsc/WSC-89.geojson';

// ZMA TRACON sectors
import hstH from '~/polys/tracon/hst/HST-H.geojson';
import nqxb from '~/polys/tracon/nqx/NQX-B.geojson';
import miaAE from '~/polys/tracon/mia/MIA-A-E.geojson';
import miaAW from '~/polys/tracon/mia/MIA-A-W.geojson';
import miaDEE from '~/polys/tracon/mia/MIA-D-EE.geojson';
import miaDEW from '~/polys/tracon/mia/MIA-D-EW.geojson';
import miaDWE from '~/polys/tracon/mia/MIA-D-WE.geojson';
import miaDWW from '~/polys/tracon/mia/MIA-D-WW.geojson';
import miaFE from '~/polys/tracon/mia/MIA-F-E.geojson';
import miaFW from '~/polys/tracon/mia/MIA-F-W.geojson';
import miaFrogzE from '~/polys/tracon/mia/MIA-FROGZ-E.geojson';
import miaFrogzW from '~/polys/tracon/mia/MIA-FROGZ-W.geojson';
import miaGE from '~/polys/tracon/mia/MIA-G-E.geojson';
import miaGW from '~/polys/tracon/mia/MIA-G-W.geojson';
import miaHE from '~/polys/tracon/mia/MIA-H-E.geojson';
import miaHW from '~/polys/tracon/mia/MIA-H-W.geojson';
import miaJE from '~/polys/tracon/mia/MIA-J-E.geojson';
import miaJW from '~/polys/tracon/mia/MIA-J-W.geojson';
import miaLEE from '~/polys/tracon/mia/MIA-L-EE.geojson';
import miaLEW from '~/polys/tracon/mia/MIA-L-EW.geojson';
import miaLWE from '~/polys/tracon/mia/MIA-L-WE.geojson';
import miaLWW from '~/polys/tracon/mia/MIA-L-WW.geojson';
import miaNE from '~/polys/tracon/mia/MIA-N-E.geojson';
import miaNW from '~/polys/tracon/mia/MIA-N-W.geojson';
import miaQEE from '~/polys/tracon/mia/MIA-Q-EE.geojson';
import miaQEW from '~/polys/tracon/mia/MIA-Q-EW.geojson';
import miaQWE from '~/polys/tracon/mia/MIA-Q-WE.geojson';
import miaQWW from '~/polys/tracon/mia/MIA-Q-WW.geojson';
import miaRE from '~/polys/tracon/mia/MIA-R-E.geojson';
import miaRW from '~/polys/tracon/mia/MIA-R-W.geojson';
import miaSE from '~/polys/tracon/mia/MIA-S-E.geojson';
import miaSW from '~/polys/tracon/mia/MIA-S-W.geojson';
import miaVE from '~/polys/tracon/mia/MIA-V-E.geojson';
import miaVW from '~/polys/tracon/mia/MIA-V-W.geojson';
import miaWE from '~/polys/tracon/mia/MIA-W-E.geojson';
import miaWW from '~/polys/tracon/mia/MIA-W-W.geojson';
import miaZEE from '~/polys/tracon/mia/MIA-Z-EE.geojson';
import miaZEW from '~/polys/tracon/mia/MIA-Z-EW.geojson';
import miaZWE from '~/polys/tracon/mia/MIA-Z-WE.geojson';
import miaZWW from '~/polys/tracon/mia/MIA-Z-WW.geojson';
import pbiAE from '~/polys/tracon/pbi/PBI-A-E.geojson';
import pbiAW from '~/polys/tracon/pbi/PBI-A-W.geojson';
import pbiBE from '~/polys/tracon/pbi/PBI-B-E.geojson';
import pbiBW from '~/polys/tracon/pbi/PBI-B-W.geojson';
import pbiFE from '~/polys/tracon/pbi/PBI-F-E.geojson';
import pbiFW from '~/polys/tracon/pbi/PBI-F-W.geojson';
import pbiH from '~/polys/tracon/pbi/PBI-H.geojson';
import pbiIE from '~/polys/tracon/pbi/PBI-I-E.geojson';
import pbiIW from '~/polys/tracon/pbi/PBI-I-W.geojson';
import pbiN from '~/polys/tracon/pbi/PBI-N.geojson';
import pbiPE from '~/polys/tracon/pbi/PBI-P-E.geojson';
import pbiPW from '~/polys/tracon/pbi/PBI-P-W.geojson';
import pbiS from '~/polys/tracon/pbi/PBI-S.geojson';
import rswEE from '~/polys/tracon/rsw/RSW-E-E.geojson';
import rswEW from '~/polys/tracon/rsw/RSW-E-W.geojson';
import rswFE from '~/polys/tracon/rsw/RSW-F-E.geojson';
import rswFW from '~/polys/tracon/rsw/RSW-F-W.geojson';
import rswGE from '~/polys/tracon/rsw/RSW-G-E.geojson';
import rswGW from '~/polys/tracon/rsw/RSW-G-W.geojson';
import rswLE from '~/polys/tracon/rsw/RSW-L-E.geojson';
import rswLW from '~/polys/tracon/rsw/RSW-L-W.geojson';
import rswSE from '~/polys/tracon/rsw/RSW-S-E.geojson';
import rswSW from '~/polys/tracon/rsw/RSW-S-W.geojson';
import rswWE from '~/polys/tracon/rsw/RSW-W-E.geojson';
import rswWW from '~/polys/tracon/rsw/RSW-W-W.geojson';
import tpaBN from '~/polys/tracon/tpa/TPA-B-N.geojson';
import tpaBS from '~/polys/tracon/tpa/TPA-B-S.geojson';
import tpaDN from '~/polys/tracon/tpa/TPA-D-N.geojson';
import tpaDS from '~/polys/tracon/tpa/TPA-D-S.geojson';
import tpaEN from '~/polys/tracon/tpa/TPA-E-N.geojson';
import tpaES from '~/polys/tracon/tpa/TPA-E-S.geojson';
import tpaFN from '~/polys/tracon/tpa/TPA-F-N.geojson';
import tpaFS from '~/polys/tracon/tpa/TPA-F-S.geojson';
import tpaGN from '~/polys/tracon/tpa/TPA-G-N.geojson';
import tpaGS from '~/polys/tracon/tpa/TPA-G-S.geojson';
import tpaM from '~/polys/tracon/tpa/TPA-M.geojson';
import tpaPN from '~/polys/tracon/tpa/TPA-P-N.geojson';
import tpaPS from '~/polys/tracon/tpa/TPA-P-S.geojson';
import tpaRN from '~/polys/tracon/tpa/TPA-R.geojson';
import tpaSN from '~/polys/tracon/tpa/TPA-S-N.geojson';
import tpaSS from '~/polys/tracon/tpa/TPA-S-S.geojson';
import tpaWN from '~/polys/tracon/tpa/TPA-W-N.geojson';
import tpaWS from '~/polys/tracon/tpa/TPA-W-S.geojson';

const colors = ['#e60049', '#0bb4ff', '#e6d800', '#50e991', '#fd9a5c', '#5100e6', '#621065', '#31754f'];

type PolygonEntry = { name: string; url: string };

const centerArea = (name: string, entries: PolygonEntry[]): CenterAreaDefinition => ({
  name,
  sectors: entries.map((entry, index) => ({
    sectorName: entry.name,
    defaultColor: colors[index % colors.length],
    polyUrl: entry.url,
  })),
});

const traconArea = (name: string, entries: PolygonEntry[]): TraconAreaPolys => ({
  name,
  defaultConfig: '',
  possibleConfigs: [''],
  sectorConfigs: entries.map((entry, index) => ({
    sectorName: entry.name,
    defaultColor: colors[index % colors.length],
    configPolyUrls: [{ configs: [''], url: entry.url }],
  })),
});

export const MAP_STYLES: MapStyle[] = [
  DEFAULT_MAP_STYLE,
  { value: 'mapbox://styles/mapbox/light-v11', label: 'World Light', disabled: false },
  { value: 'mapbox://styles/mapbox/dark-v11', label: 'World Dark', disabled: false },
  { value: 'mapbox://styles/kengreim/clw6l16rw002o01q1cq9h43ft', label: 'Satellite Low Opacity', disabled: false },
];

export const BASE_MAPS: BaseMap[] = [
  { name: 'LO W-S', url: 'mapbox://kengreim.4525vady', sourceLayer: '01GE9SE1H343T0ZZQ6DP787MKV-2yipi9', showDefault: true },
  { name: 'HI W-S', url: 'mapbox://kengreim.06318cwy', sourceLayer: '3_HI-W-536qzx', showDefault: false },
  { name: 'LO E-N', url: 'mapbox://kengreim.24hjuu7e', sourceLayer: '2_LO-E-68fxnv', showDefault: false },
  { name: 'HI E-N', url: 'mapbox://kengreim.1pttoy8k', sourceLayer: '4_HI-E-ddd7d9', showDefault: false },
];

export const CENTER_POLY_DEFINITIONS: CenterAreaDefinition[] = [
  centerArea('ATL', [
    { name: 'ATL-01', url: atl01 }, { name: 'ATL-02', url: atl02 }, { name: 'ATL-17', url: atl17 },
    { name: 'ATL-18', url: atl18 }, { name: 'ATL-19', url: atl19 }, { name: 'ATL-21', url: atl21 },
  ]),
  centerArea('CAR', [
    { name: 'CAR-40', url: car40 }, { name: 'CAR-41', url: car41 }, { name: 'CAR-42', url: car42 },
    { name: 'CAR-44', url: car44 }, { name: 'CAR-61', url: car61 },
  ]),
  centerArea('CST', [
    { name: 'CST-04', url: cst04 }, { name: 'CST-20', url: cst20 }, { name: 'CST-22', url: cst22 }, { name: 'CST-23', url: cst23 },
  ]),
  centerArea('EVG', [
    { name: 'EVG-46', url: evg46 }, { name: 'EVG-47', url: evg47 }, { name: 'EVG-64', url: evg64 }, { name: 'EVG-65', url: evg65 },
    { name: 'EVG-66', url: evg66 }, { name: 'EVG-67', url: evg67 }, { name: 'EVG-68', url: evg68 },
  ]),
  centerArea('OCN', [
    { name: 'OCN-43', url: ocn43 }, { name: 'OCN-58', url: ocn58 }, { name: 'OCN-59', url: ocn59 },
    { name: 'OCN-60', url: ocn60 }, { name: 'OCN-62', url: ocn62 }, { name: 'OCN-63', url: ocn63 },
  ]),
  centerArea('WSC', [
    { name: 'WSC-05', url: wsc05 }, { name: 'WSC-06', url: wsc06 }, { name: 'WSC-07', url: wsc07 },
    { name: 'WSC-08', url: wsc08 }, { name: 'WSC-24', url: wsc24 }, { name: 'WSC-25', url: wsc25 }, { name: 'WSC-89', url: wsc89 },
  ]),
];

export const TRACON_POLY_DEFINITIONS: TraconPolyDefinition[] = [
  { name: 'HST', polys: traconArea('HST', [{ name: 'HST-H', url: hstH }]) },
  { name: 'NQX', polys: traconArea('NQX', [{ name: 'NQX-B', url: nqxb }]) },
  { name: 'MIA', polys: traconArea('MIA', [
    { name: 'MIA-A-E', url: miaAE }, { name: 'MIA-A-W', url: miaAW }, { name: 'MIA-D-EE', url: miaDEE }, { name: 'MIA-D-EW', url: miaDEW },
    { name: 'MIA-D-WE', url: miaDWE }, { name: 'MIA-D-WW', url: miaDWW }, { name: 'MIA-F-E', url: miaFE }, { name: 'MIA-F-W', url: miaFW },
    { name: 'MIA-FROGZ-E', url: miaFrogzE }, { name: 'MIA-FROGZ-W', url: miaFrogzW }, { name: 'MIA-G-E', url: miaGE }, { name: 'MIA-G-W', url: miaGW },
    { name: 'MIA-H-E', url: miaHE }, { name: 'MIA-H-W', url: miaHW }, { name: 'MIA-J-E', url: miaJE }, { name: 'MIA-J-W', url: miaJW },
    { name: 'MIA-L-EE', url: miaLEE }, { name: 'MIA-L-EW', url: miaLEW }, { name: 'MIA-L-WE', url: miaLWE }, { name: 'MIA-L-WW', url: miaLWW },
    { name: 'MIA-N-E', url: miaNE }, { name: 'MIA-N-W', url: miaNW }, { name: 'MIA-Q-EE', url: miaQEE }, { name: 'MIA-Q-EW', url: miaQEW },
    { name: 'MIA-Q-WE', url: miaQWE }, { name: 'MIA-Q-WW', url: miaQWW }, { name: 'MIA-R-E', url: miaRE }, { name: 'MIA-R-W', url: miaRW },
    { name: 'MIA-S-E', url: miaSE }, { name: 'MIA-S-W', url: miaSW }, { name: 'MIA-V-E', url: miaVE }, { name: 'MIA-V-W', url: miaVW },
    { name: 'MIA-W-E', url: miaWE }, { name: 'MIA-W-W', url: miaWW }, { name: 'MIA-Z-EE', url: miaZEE }, { name: 'MIA-Z-EW', url: miaZEW },
    { name: 'MIA-Z-WE', url: miaZWE }, { name: 'MIA-Z-WW', url: miaZWW },
  ] ) },
  { name: 'PBI', polys: traconArea('PBI', [
    { name: 'PBI-A-E', url: pbiAE }, { name: 'PBI-A-W', url: pbiAW }, { name: 'PBI-B-E', url: pbiBE }, { name: 'PBI-B-W', url: pbiBW },
    { name: 'PBI-F-E', url: pbiFE }, { name: 'PBI-F-W', url: pbiFW }, { name: 'PBI-H', url: pbiH }, { name: 'PBI-I-E', url: pbiIE },
    { name: 'PBI-I-W', url: pbiIW }, { name: 'PBI-N', url: pbiN }, { name: 'PBI-P-E', url: pbiPE }, { name: 'PBI-P-W', url: pbiPW }, { name: 'PBI-S', url: pbiS },
  ]) },
  { name: 'RSW', polys: traconArea('RSW', [
    { name: 'RSW-E-E', url: rswEE }, { name: 'RSW-E-W', url: rswEW }, { name: 'RSW-F-E', url: rswFE }, { name: 'RSW-F-W', url: rswFW },
    { name: 'RSW-G-E', url: rswGE }, { name: 'RSW-G-W', url: rswGW }, { name: 'RSW-L-E', url: rswLE }, { name: 'RSW-L-W', url: rswLW },
    { name: 'RSW-S-E', url: rswSE }, { name: 'RSW-S-W', url: rswSW }, { name: 'RSW-W-E', url: rswWE }, { name: 'RSW-W-W', url: rswWW },
  ]) },
  { name: 'TPA', polys: traconArea('TPA', [
    { name: 'TPA-B-N', url: tpaBN }, { name: 'TPA-B-S', url: tpaBS }, { name: 'TPA-D-N', url: tpaDN }, { name: 'TPA-D-S', url: tpaDS },
    { name: 'TPA-E-N', url: tpaEN }, { name: 'TPA-E-S', url: tpaES }, { name: 'TPA-F-N', url: tpaFN }, { name: 'TPA-F-S', url: tpaFS },
    { name: 'TPA-G-N', url: tpaGN }, { name: 'TPA-G-S', url: tpaGS }, { name: 'TPA-M', url: tpaM }, { name: 'TPA-P-N', url: tpaPN },
    { name: 'TPA-P-S', url: tpaPS }, { name: 'TPA-R', url: tpaRN }, { name: 'TPA-S-N', url: tpaSN }, { name: 'TPA-S-S', url: tpaSS },
    { name: 'TPA-W-N', url: tpaWN }, { name: 'TPA-W-S', url: tpaWS },
  ]) },
];

export const SECTOR_AREA_MAP = new Map<string, string>([
  ...CENTER_POLY_DEFINITIONS.flatMap((area) => area.sectors.map((sector) => [sector.sectorName, area.name] as const)),
  ...TRACON_POLY_DEFINITIONS.flatMap((definition) => definition.polys.sectorConfigs.map((sector) => [sector.sectorName, definition.name] as const)),
]);
