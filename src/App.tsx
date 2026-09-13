import { makePersisted } from '@solid-primitives/storage';
import { Component, createEffect, createSignal, DEV, For, Show } from 'solid-js';
import { DEFAULT_MAP_STYLE, DEFAULT_SETTINGS, DEFAULT_VIEWPORT } from '~/lib/defaults';
import { Section, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui-core';
import { MapStyleSelector } from '~/components/MapStyleSelector';
import { createStore, produce } from 'solid-js/store';
import { BASE_MAPS, CENTER_POLY_DEFINITIONS, TRACON_POLY_DEFINITIONS } from '~/lib/config';
import {
  CenterAirspaceDisplayState,
  AppDisplayState,
  CenterAreaDefinition,
  FillPaint,
  MountedBaseMapState,
  PersistedBaseMapState,
  PopupState,
  Settings,
  ArrivalProcedure,
  TraconAreaPolys,
  TraconAirspaceDisplayState,
} from '~/lib/types';
import { Footer } from '~/components/Footer';
import { MapReset } from '~/components/MapReset';

// Mapbox
import MapGL from 'solid-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { BaseMaps } from '~/components/BaseMaps';
import { BaseMapColorSync } from '~/components/BaseMapColorSync';
import { StyleSwitchFix } from '~/components/StyleSwitchFix';
import { GeojsonPolySources } from '~/components/GeojsonPolySources';
import { GeojsonPolyLayers } from '~/components/GeojsonPolyLayers';
import { SectorDisplayWithControls } from '~/components/SectorDisplayWithControls';
import { SettingsDialog } from '~/components/SettingsDialog';
import { GeoJSONFeature, MapMouseEvent } from 'mapbox-gl';
import { getUniqueLayers, isTransparentFill, getGeojsonSources } from '~/lib/geojson';
import { logIfDev } from '~/lib/dev';
import { InfoPopup } from '~/components/InfoPopup';
import { ProceduresDialog } from '~/components/ProceduresDialog';
import { ArrivalPoints } from '~/components/ArrivalPoints';
import { ShareButton } from '~/components/ShareButton';
import {
  getURLStateParam,
  decodeStateFromURL,
  applyURLStateToDefaults,
} from '~/lib/urlState';

type TraconSplitOption = { value: string; sectors: string[] };
type TraconSplitPicker = {
  airport: string;
  area: string;
  options: TraconSplitOption[];
  commonSectors?: string[];
  noneClearsArea?: boolean;
};

const TRACON_SPLIT_PICKERS: TraconSplitPicker[] = [
  {
    airport: 'MIA',
    area: 'MIA',
    noneClearsArea: true,
    options: [
      { value: 'None', sectors: [] },
      { value: 'E', sectors: ['MIA-A-E', 'MIA-D-EE', 'MIA-D-EW', 'MIA-F-E', 'MIA-FROGZ-E', 'MIA-G-E', 'MIA-H-E', 'MIA-J-E', 'MIA-L-EE', 'MIA-L-EW', 'MIA-N-E', 'MIA-Q-EE', 'MIA-Q-EW', 'MIA-R-E', 'MIA-S-E', 'MIA-V-E', 'MIA-W-E', 'MIA-Z-EE', 'MIA-Z-EW'] },
      { value: 'W', sectors: ['MIA-A-W', 'MIA-D-WE', 'MIA-D-WW', 'MIA-F-W', 'MIA-FROGZ-W', 'MIA-G-W', 'MIA-H-W', 'MIA-J-W', 'MIA-L-WE', 'MIA-L-WW', 'MIA-N-W', 'MIA-Q-WE', 'MIA-Q-WW', 'MIA-R-W', 'MIA-S-W', 'MIA-V-W', 'MIA-W-W', 'MIA-Z-WE', 'MIA-Z-WW'] },
    ],
  },
  {
    airport: 'FLL',
    area: 'MIA',
    options: [{ value: 'None', sectors: [] }, { value: 'E', sectors: ['MIA-F-E'] }, { value: 'W', sectors: ['MIA-F-W'] }],
  },
  {
    airport: 'PBI',
    area: 'PBI',
    commonSectors: ['PBI-N', 'PBI-S', 'PBI-H'],
    noneClearsArea: true,
    options: [
      { value: 'None', sectors: [] },
      { value: 'E', sectors: ['PBI-A-E', 'PBI-B-E', 'PBI-F-E', 'PBI-I-E', 'PBI-P-E'] },
      { value: 'W', sectors: ['PBI-A-W', 'PBI-B-W', 'PBI-F-W', 'PBI-I-W', 'PBI-P-W'] },
    ],
  },
  {
    airport: 'RSW',
    area: 'RSW',
    noneClearsArea: true,
    options: [
      { value: 'None', sectors: [] },
      { value: 'E', sectors: ['RSW-E-E', 'RSW-E-W', 'RSW-F-E', 'RSW-F-W', 'RSW-G-E', 'RSW-G-W'] },
      { value: 'W', sectors: ['RSW-L-E', 'RSW-L-W', 'RSW-S-E', 'RSW-S-W', 'RSW-W-E', 'RSW-W-W'] },
    ],
  },
  {
    airport: 'TPA',
    area: 'TPA',
    noneClearsArea: true,
    options: [
      { value: 'None', sectors: [] },
      { value: 'N', sectors: ['TPA-B-N', 'TPA-D-N', 'TPA-E-N', 'TPA-F-N', 'TPA-G-N', 'TPA-P-N', 'TPA-S-N', 'TPA-W-N'] },
      { value: 'S', sectors: ['TPA-B-S', 'TPA-D-S', 'TPA-E-S', 'TPA-F-S', 'TPA-G-S', 'TPA-P-S', 'TPA-S-S', 'TPA-W-S'] },
    ],
  },
];

const splitLabel = (split: string) => {
  if (split === 'None') return 'None';
  return split;
};

const createCenterDefaultState = (area: CenterAreaDefinition): CenterAirspaceDisplayState => ({
  name: area.name,
  sectors: area.sectors.map((s) => ({
    name: s.sectorName,
    isDisplayed: false,
    color: s.defaultColor,
  })),
});

const createTraconDefaultState = (config: TraconAreaPolys): TraconAirspaceDisplayState => ({
  name: config.name,
  selectedConfig: config.defaultConfig,
  sectors: config.sectorConfigs.map((c) => ({
    name: c.sectorName,
    parentAreaName: config.name,
    isDisplayed: false,
    color: c.defaultColor,
  })),
});

const App: Component = () => {
  const [viewport, setViewport] = makePersisted(createSignal(DEFAULT_VIEWPORT), {
    name: 'viewport',
  });

  const [mapStyle, setMapStyle] = makePersisted(createSignal(DEFAULT_MAP_STYLE), {
    name: 'mapStyle',
  });

  const [persistedBaseMaps] = makePersisted(
    createStore<PersistedBaseMapState[]>(
      BASE_MAPS.map((m) => ({
        id: m.name,
        baseMap: m,
        checked: m.showDefault,
      })),
    ),
    { name: 'baseMaps' },
  );

  const [mountedBaseMaps] = createStore<MountedBaseMapState[]>(
    persistedBaseMaps.map((m) => ({ id: m.baseMap.name, hasMounted: m.checked })),
  );

  const [cursor, setCursor] = createSignal('grab');

  const [settings, setSettings] = makePersisted(createStore<Settings>(DEFAULT_SETTINGS), {
    name: 'settings',
  });

  const centerSources = CENTER_POLY_DEFINITIONS.flatMap((a) =>
    a.sectors.map((s: { sectorName: string; polyUrl: string }) => ({
      id: s.sectorName,
      url: s.polyUrl,
    })),
  );

  const traconSources = TRACON_POLY_DEFINITIONS.flatMap((p) => getGeojsonSources(p.polys));

  const allSources = [...centerSources, ...traconSources];

  const [activeTab, setActiveTab] = createSignal<'tracon' | 'center'>('tracon');

  // Check for URL state parameter and decode it
  const urlStateParam = getURLStateParam();
  const decodedURLState = decodeStateFromURL(urlStateParam);

  // Create default state
  const defaultDisplayState: AppDisplayState = {
    centerDisplayStates: CENTER_POLY_DEFINITIONS.map(createCenterDefaultState),
    areaDisplayStates: TRACON_POLY_DEFINITIONS.map((p) => createTraconDefaultState(p.polys)),
  };

  // Invalidate persisted state if area names don't match current config
  // (handles renames without requiring users to clear localStorage)
  const storedDisplay = localStorage.getItem('currentDisplay');
  if (storedDisplay) {
    try {
      const parsed = JSON.parse(storedDisplay) as AppDisplayState;
      const expectedCenterNames = CENTER_POLY_DEFINITIONS.map((a) => a.name);
      const expectedTraconNames = TRACON_POLY_DEFINITIONS.map((p) => p.polys.name);
      const storedCenterNames = parsed.centerDisplayStates?.map((s) => s.name) ?? [];
      const storedTraconNames = parsed.areaDisplayStates?.map((s) => s.name) ?? [];

      if (
        expectedCenterNames.some((name, i) => storedCenterNames[i] !== name) ||
        expectedTraconNames.some((name, i) => storedTraconNames[i] !== name)
      ) {
        localStorage.removeItem('currentDisplay');
      }
    } catch {
      localStorage.removeItem('currentDisplay');
    }
  }

  // Create persisted store (will load from localStorage if available)
  const [allStore, setAllStore] = makePersisted(createStore<AppDisplayState>(defaultDisplayState), {
    name: 'currentDisplay',
  });

  const [selectedSplits, setSelectedSplits] = createStore<Record<string, string>>(
    Object.fromEntries(TRACON_SPLIT_PICKERS.map((picker) => [picker.airport, picker.options[0].value])),
  );

  const setTraconSectors = (areaName: string, sectorNames: string[], isDisplayed: boolean) => {
    setAllStore(
      'areaDisplayStates',
      (area) => area.name === areaName,
      'sectors',
      (sector) => sectorNames.includes(sector.name),
      'isDisplayed',
      isDisplayed,
    );
  };

  const selectTraconSplit = (picker: TraconSplitPicker, selectedSplit: string) => {
    setSelectedSplits(picker.airport, selectedSplit);
    const selectedOption = picker.options.find((option) => option.value === selectedSplit);

    if (selectedSplit === 'None') {
      if (picker.noneClearsArea) {
        setAllStore('areaDisplayStates', (area) => area.name === picker.area, 'sectors', (_sector) => true, 'isDisplayed', false);
      } else {
        setTraconSectors(picker.area, picker.options.flatMap((option) => option.sectors), false);
      }
      return;
    }

    picker.options.forEach((option) => {
      setTraconSectors(picker.area, option.sectors, option.value === selectedOption?.value);
    });
    if (picker.commonSectors) {
      setTraconSectors(picker.area, picker.commonSectors, true);
    }
  };

  // If URL state exists, override whatever makePersisted loaded from localStorage
  if (decodedURLState) {
    const urlDisplayState = applyURLStateToDefaults(
      decodedURLState,
      CENTER_POLY_DEFINITIONS,
      TRACON_POLY_DEFINITIONS,
      createCenterDefaultState,
      createTraconDefaultState,
    );
    setAllStore(urlDisplayState);
  }

  TRACON_SPLIT_PICKERS.forEach((picker) => {
    const selectedSplit =
      picker.options.find((option) =>
        option.sectors.some((sectorName) =>
          allStore.areaDisplayStates.find((area) => area.name === picker.area)?.sectors.some((sector) => sector.name === sectorName && sector.isDisplayed),
        ),
      )?.value ?? picker.options[0].value;
    setSelectedSplits(picker.airport, selectedSplit);
    picker.options
      .filter((option) => option.value !== selectedSplit)
      .forEach((option) => setTraconSectors(picker.area, option.sectors, false));
  });

  const [popup, setPopup] = createStore<PopupState>({
    hoveredPolys: [],
    vis: false,
  });

  const [displayedArrivals, setDisplayedArrivals] = createSignal<ArrivalProcedure[]>([]);
  const [isProceduresOpen, setIsProceduresOpen] = createSignal(false);

  const altitudeHover = (evt: MapMouseEvent) => {
    if (!evt.target.isStyleLoaded()) return;
    const features: GeoJSONFeature[] = evt.target.queryRenderedFeatures(evt.point, {
      filter: ['all', ['==', ['geometry-type'], 'Polygon'], ['has', 'minAlt'], ['has', 'maxAlt']],
    });
    const fillLayers = getUniqueLayers(features.filter((f) => f.layer?.type == 'fill'));
    if (fillLayers.length > 0) {
      logIfDev(fillLayers);
      let transparentLayers: GeoJSONFeature[] = [];
      let visibleLayers: GeoJSONFeature[] = [];
      fillLayers.forEach((l) =>
        isTransparentFill(l.layer?.paint as FillPaint) ? transparentLayers.push(l) : visibleLayers.push(l),
      );
      if (settings.popup.showUncheckedSectors) {
        setPopup(
          produce((state) => {
            state.vis = settings.popup.uncheckedSectorsInVisibleSectorsOnly ? visibleLayers.length > 0 : true;
            state.hoveredPolys = fillLayers;
          }),
        );
      } else {
        setPopup(
          produce((state) => {
            state.vis = visibleLayers.length > 0;
            state.hoveredPolys = visibleLayers;
          }),
        );
      }
    } else {
      setPopup('vis', false);
    }
  };

  createEffect(() => {
    if (popup.vis) setCursor('crosshair');
    else setCursor('grab');
  });

  const handleArrivalToggle = (arrival: ArrivalProcedure, isDisplayed: boolean) => {
    setDisplayedArrivals((prev) => {
      if (isDisplayed) {
        return [...prev, arrival];
      } else {
        return prev.filter((a) => a.arrivalIdentifier !== arrival.arrivalIdentifier);
      }
    });
  };

  // Helper to create a persisted config signal that uses URL state if available
  // makePersisted ignores initial value if localStorage has data, so we must
  // explicitly set the value after creation when URL state is present
  // Console debugging effects only created in DEV
  if (import.meta.env.DEV) {
    createEffect(() => {
      console.log('Sectors display state', allStore.areaDisplayStates);
    });
    createEffect(() => {
      console.log('Popup visibility state changed', popup.vis);
    });
  }

  return (
    <div class="flex h-screen">
      <div class="flex flex-col bg-slate-900 p-4 justify-between overflow-auto overscroll-contain z-50 pr-6">
        <div class="flex flex-col space-y-4">
          <h1 class="text-white text-2xl">ZMA Visualizer</h1>

          <button
            onClick={() => setIsProceduresOpen((prev: any) => !prev)}
            class="flex items-center justify-center w-36 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors cursor-pointer"
            title="Airport Procedures"
          >
            Procedures
          </button>

          <Section header="Style">
            <MapStyleSelector style={mapStyle} setStyle={setMapStyle} />
          </Section>

          <Section header="" class="space-y-2">
            <Show when={activeTab() === 'tracon'}>
              <div class="grid grid-cols-2 gap-2">
                <For each={TRACON_SPLIT_PICKERS}>
                  {(picker) => (
                    <div>
                      <label class="mb-1 block text-xs font-medium text-slate-400">{picker.airport}</label>
                      <Select
                        options={picker.options.map((option) => option.value)}
                        value={selectedSplits[picker.airport]}
                        onChange={(value) => {
                          if (value) selectTraconSplit(picker, value);
                        }}
                        disallowEmptySelection={true}
                        itemComponent={(props) => <SelectItem item={props.item}>{splitLabel(props.item.rawValue)}</SelectItem>}
                      >
                        <SelectTrigger aria-label={`${picker.airport} split`}>
                          <SelectValue<string>>{(state) => splitLabel(state.selectedOption())}</SelectValue>
                        </SelectTrigger>
                        <SelectContent />
                      </Select>
                    </div>
                  )}
                </For>
              </div>
            </Show>
            <div class="flex border-b border-slate-600 mb-2">
              <button
                class={`px-4 py-2 font-medium ${activeTab() === 'tracon' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
                onClick={() => setActiveTab('tracon')}
              >
                TRACON
              </button>
              <button
                class={`px-4 py-2 font-medium ${activeTab() === 'center' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
                onClick={() => setActiveTab('center')}
              >
                Center
              </button>
            </div>

            <Show when={activeTab() === 'tracon'}>
              <For each={TRACON_POLY_DEFINITIONS}>
                {(definition) => (
                  <div class={definition.parentGroup ? 'ml-4' : undefined}>
                    <SectorDisplayWithControls
                      displayType="tracon"
                      airspaceGroup={definition.name}
                      hideConfigSelector={true}
                      store={allStore}
                      setStore={setAllStore}
                    />
                  </div>
                )}
              </For>
            </Show>

            <Show when={activeTab() === 'center'}>
              <For each={CENTER_POLY_DEFINITIONS}>
                {(definition) => (
                  <SectorDisplayWithControls
                    displayType="center"
                    airspaceGroup={definition.name}
                    store={allStore}
                    setStore={setAllStore}
                  />
                )}
              </For>
            </Show>
          </Section>
        </div>
        <Footer />
      </div>
      <div class="grow relative">
        <InfoPopup popupState={popup} settings={settings} />

        <div class="absolute top-5 left-5 z-50 flex space-x-2">
          <SettingsDialog settings={settings} setSettings={setSettings} />
          <ShareButton
            store={allStore}
            centerDefaults={CENTER_POLY_DEFINITIONS}
            traconDefaults={TRACON_POLY_DEFINITIONS}
          />
        </div>

        <MapReset viewport={viewport()} setViewport={setViewport} />

        <MapGL
          options={{
            accessToken: import.meta.env.VITE_MAPBOX_KEY,
            style: mapStyle().value,
          }}
          viewport={viewport()}
          onViewportChange={setViewport}
          class="h-full w-full"
          debug={!!DEV}
          onMouseMove={altitudeHover}
          cursorStyle={cursor()}
        >
          <StyleSwitchFix />
          <BaseMaps persistedMapsState={persistedBaseMaps} mountedMapsState={mountedBaseMaps} />
          <BaseMapColorSync isDark={mapStyle().label === 'World Dark'} />
          <GeojsonPolySources sources={allSources} />
          <GeojsonPolyLayers displayStateStore={allStore} type="tracon" allPolys={TRACON_POLY_DEFINITIONS} />
          <GeojsonPolyLayers displayStateStore={allStore} type="center" />
          <ArrivalPoints arrivals={displayedArrivals()} />
        </MapGL>
      </div>

      <ProceduresDialog
        isOpen={isProceduresOpen()}
        onClose={() => setIsProceduresOpen(false)}
        onArrivalToggle={handleArrivalToggle}
      />
    </div>
  );
};

export default App;
