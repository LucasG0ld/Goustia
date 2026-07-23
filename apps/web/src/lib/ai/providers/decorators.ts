import type {
  RecipeGenerationRequest,
  RecipeGenerationResponse,
  RecipeGenerator,
  RecipeImageGenerator,
  RecipeImageRequest,
  RecipeImageResponse,
} from "./contracts";
import {
  executeWithResilience,
  ProviderCircuitBreaker,
  type ResilienceOptions,
} from "./resilience";

export class ResilientRecipeGenerator implements RecipeGenerator {
  readonly provider;
  readonly model;

  constructor(
    private readonly delegate: RecipeGenerator,
    private readonly options: ResilienceOptions,
    private readonly breaker = new ProviderCircuitBreaker(),
  ) {
    this.provider = delegate.provider;
    this.model = delegate.model;
  }

  generate(
    request: RecipeGenerationRequest,
    signal?: AbortSignal,
  ): Promise<RecipeGenerationResponse> {
    return executeWithResilience(
      `${this.provider}:text`,
      (attemptSignal) => this.delegate.generate(request, attemptSignal),
      this.options,
      this.breaker,
      signal,
    );
  }
}

export class ResilientRecipeImageGenerator implements RecipeImageGenerator {
  readonly provider;
  readonly model;

  constructor(
    private readonly delegate: RecipeImageGenerator,
    private readonly options: ResilienceOptions,
    private readonly breaker = new ProviderCircuitBreaker(),
  ) {
    this.provider = delegate.provider;
    this.model = delegate.model;
  }

  generate(
    request: RecipeImageRequest,
    signal?: AbortSignal,
  ): Promise<RecipeImageResponse> {
    return executeWithResilience(
      `${this.provider}:image`,
      (attemptSignal) => this.delegate.generate(request, attemptSignal),
      this.options,
      this.breaker,
      signal,
    );
  }
}

export class FallbackRecipeGenerator implements RecipeGenerator {
  readonly provider;
  readonly model;

  constructor(
    private readonly primary: RecipeGenerator,
    private readonly fallback: RecipeGenerator,
  ) {
    this.provider = primary.provider;
    this.model = primary.model;
  }

  async generate(
    request: RecipeGenerationRequest,
    signal?: AbortSignal,
  ): Promise<RecipeGenerationResponse> {
    try {
      return await this.primary.generate(request, signal);
    } catch {
      return this.fallback.generate(request, signal);
    }
  }
}

export class FallbackRecipeImageGenerator implements RecipeImageGenerator {
  readonly provider;
  readonly model;

  constructor(
    private readonly primary: RecipeImageGenerator,
    private readonly fallback: RecipeImageGenerator,
  ) {
    this.provider = primary.provider;
    this.model = primary.model;
  }

  async generate(
    request: RecipeImageRequest,
    signal?: AbortSignal,
  ): Promise<RecipeImageResponse> {
    try {
      return await this.primary.generate(request, signal);
    } catch {
      return this.fallback.generate(request, signal);
    }
  }
}
