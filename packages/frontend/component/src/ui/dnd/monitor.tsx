import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { monitorForExternal } from '@atlaskit/pragmatic-drag-and-drop/external/adapter';
import type {
  DragLocationHistory,
  ElementDragType,
} from '@atlaskit/pragmatic-drag-and-drop/types';
import { useContext, useEffect, useMemo } from 'react';

import { getAdaptedEventArgs } from './common';
import { DNDContext } from './context';
import type { DNDData, fromExternalData } from './types';

export type MonitorGetFeedback<D extends DNDData = DNDData> = Parameters<
  NonNullable<Parameters<typeof monitorForElements>[0]['canMonitor']>
>[0] & {
  source: {
    data: D['draggable'];
  };
};

type MonitorGet<T, D extends DNDData = DNDData> =
  | T
  | ((data: MonitorGetFeedback<D>) => T);

export type MonitorDragEvent<D extends DNDData = DNDData> = {
  location: DragLocationHistory;
  source: Exclude<ElementDragType['payload'], 'data'> & {
    data: D['draggable'];
  };
};

export interface MonitorOptions<D extends DNDData = DNDData> {
  canMonitor?: MonitorGet<boolean, D>;
  onDragStart?: (data: MonitorDragEvent<D>) => void;
  onDrag?: (data: MonitorDragEvent<D>) => void;
  onDrop?: (data: MonitorDragEvent<D>) => void;
  onDropTargetChange?: (data: MonitorDragEvent<D>) => void;
  fromExternalData?: fromExternalData<D>;
  allowExternal?: boolean;
}

function monitorGet<D extends DNDData, T>(
  get: MonitorGet<T, D> | undefined,
  options: MonitorOptions<D>
): ((args: MonitorGetFeedback<D>) => T) | undefined {
  if (get === undefined) {
    return undefined;
  }

  return (args: MonitorGetFeedback<D>) => {
    const adaptedArgs = getAdaptedEventArgs(args, options.fromExternalData);

    if (typeof get === 'function') {
      return get(adaptedArgs);
    }

    return {
      ...adaptedArgs,
      ...get,
    } as T;
  };
}

export const useDndMonitor = <D extends DNDData = DNDData>(
  getOptions: () => MonitorOptions<D> = () => ({}),
  deps: unknown[] = []
) => {
  const dropTargetContext = useContext(DNDContext);

  const options = useMemo(() => {
    const opts = getOptions();
    const allowExternal = opts.allowExternal ?? !!opts.fromExternalData;

    return {
      ...opts,
      allowExternal,
      fromExternalData: allowExternal
        ? (opts.fromExternalData ??
            (dropTargetContext.fromExternalData as fromExternalData<D>))
        : undefined,
    };
  }, [...deps, getOptions, dropTargetContext.fromExternalData]);

  const monitorOptions = useMemo(() => {
    return {
      canMonitor: monitorGet(options.canMonitor, options),
      onDragStart: monitorGet(options.onDragStart, options),
      onDrag: monitorGet(options.onDrag, options),
      onDrop: monitorGet(options.onDrop, options),
      onDropTargetChange: monitorGet(options.onDropTargetChange, options),
    };
  }, [options]);

  useEffect(() => {
    return monitorForElements(monitorOptions);
  }, [monitorOptions]);

  useEffect(() => {
    if (!options.fromExternalData) return;

    return monitorForExternal(monitorOptions);
  }, [monitorOptions, options.fromExternalData]);
};

export { monitorForElements };
