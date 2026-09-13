import { makePersisted } from '@solid-primitives/storage';
import { Accessor, Component, createEffect, createSignal, DEV, For, Show } from 'solid-js';
import { DEFAULT_MAP_STYLE, DEFAULT_SETTINGS, DEFAULT_VIEWPORT } from '~/lib/defaults';
import { Section } from '~/components/ui-core';
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
import { Checkbox } from '~/components/ui-core/Checkbox';
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

  const [persistedBaseMaps, setPersistedBaseMaps] = makePersisted(
    createStore<PersistedBaseMapState[]>(
      BASE_MAPS.map((m) => ({
        id: m.name,
        baseMap: m,
        checked: m.showDefault,
      })),
    ),
    { name: 'baseMaps' },
  );

  const [mountedBaseMaps, setMountedBaseMaps] = createStore<MountedBaseMapState[]>(
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
            onClick={() => setIsProceduresOpen((prev) => !prev)}
            class="flex items-center justify-center w-36 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors cursor-pointer"
            title="Airport Procedures"
          >
            Procedures
          </button>

          <Section header="Style">
            <MapStyleSelector style={mapStyle} setStyle={setMapStyle} />
          </Section>

          <Section header="Base Maps">
            <div class="flex flex-col space-y-1">
              <For each={persistedBaseMaps}>
                {(m) => (
                  <Checkbox
                    label={m.baseMap.name}
                    checked={m.checked}
                    onChange={(val: boolean) => {
                      setPersistedBaseMaps(
                        (m1) => m1.id === m.id,
                        produce((m2) => {
                          m2.checked = val;
                        }),
                      );
                      let persisted = persistedBaseMaps.find((m1) => m1.id == m.id);
                      setMountedBaseMaps(
                        (m1) => m1.id === m.id,
                        produce((m2) => {
                          m2.hasMounted = m2.hasMounted || persisted!.checked;
                        }),
                      );
                    }}
                  />
                )}
              </For>
            </div>
          </Section>

          <Section header="" class="space-y-2">
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
                  <SectorDisplayWithControls
                    displayType="tracon"
                    airspaceGroup={definition.name}
                    hideConfigSelector={true}
                    store={allStore}
                    setStore={setAllStore}
                  />
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
