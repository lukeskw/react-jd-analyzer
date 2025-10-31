import { render, type RenderOptions } from "@testing-library/react";
import { createElement, type ReactElement, type ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

type RenderWithRouterOptions = {
  route?: string;
} & Omit<RenderOptions, "wrapper">;

type RouterWrapperProperties = { children: ReactNode };

const createRouterWrapper =
  (route: string) =>
  ({ children }: RouterWrapperProperties) =>
    createElement(MemoryRouter, { initialEntries: [route] }, children);

export const renderWithRouter = (
  ui: ReactElement,
  { route = "/", ...renderOptions }: RenderWithRouterOptions = {},
) => {
  return render(ui, {
    wrapper: createRouterWrapper(route),
    ...renderOptions,
  });
};
