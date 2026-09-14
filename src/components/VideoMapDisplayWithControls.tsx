import { Component, createMemo, createSignal, For, Show } from 'solid-js';
import { SetStoreFunction } from 'solid-js/store';
import { Checkbox } from './ui-core';
import { VideoMapDefinition } from '~/lib/config';

interface VideoMapDisplayWithControlsProps {
  airport: string;
  maps: VideoMapDefinition[];
  store: Record<string, boolean>;
  setStore: SetStoreFunction<Record<string, boolean>>;
}

export const VideoMapDisplayWithControls: Component<VideoMapDisplayWithControlsProps> = (props) => {
  const [isExpanded, setIsExpanded] = createSignal(false);
  const checkedMaps = createMemo(() => props.maps.filter((map) => props.store[map.id]));

  const showCheckAll = createMemo(() => checkedMaps().length < props.maps.length);
  const showUncheckAll = createMemo(() => checkedMaps().length > 0);

  const handleCheckboxChange = (mapId: string, value: boolean) => {
    props.setStore(mapId, value);
  };

  const handleToggleAll = (value: boolean) => {
    const updatedStore = { ...props.store };
    props.maps.forEach((map) => {
      updatedStore[map.id] = value;
    });
    props.setStore(updatedStore);
  };

  return (
    <div>
      <div class="flex flex-col space-y-1 mt-2">
        <div class="text-white flex items-center cursor-pointer group">
          <svg
            class={`w-4 h-4 text-gray-400 group-hover:text-white transition-all duration-200 transform ${isExpanded() ? 'rotate-90' : ''} mr-2 cursor-pointer`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            onClick={() => setIsExpanded(!isExpanded())}
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          <span
            class="group-hover:text-white transition-colors duration-200 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded())}
          >
            {props.airport}
          </span>

          <div class="flex ml-auto space-x-2">
            <Show when={showCheckAll()}>
              <div
                class="text-gray-400 hover:text-gray-200 transition"
                onClick={(event) => {
                  event.stopPropagation();
                  handleToggleAll(true);
                }}
                title="Check all"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </Show>
            <Show when={showUncheckAll()}>
              <div
                class="text-gray-400 hover:text-gray-200 transition"
                onClick={(event) => {
                  event.stopPropagation();
                  handleToggleAll(false);
                }}
                title="Uncheck all"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </Show>
          </div>
        </div>

        <Show when={isExpanded()}>
          <div class="pl-6 space-y-1">
            <For each={props.maps}>
              {(map) => (
                <Checkbox
                  label={map.fileName.replace(/\.geojson$/i, '')}
                  checked={!!props.store[map.id]}
                  onChange={(value: boolean) => handleCheckboxChange(map.id, value)}
                />
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
};
