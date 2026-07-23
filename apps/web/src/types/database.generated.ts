export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      account_deletion_requests: {
        Row: {
          completed_at: string | null;
          expires_at: string;
          failure_code: string | null;
          id: string;
          idempotency_key: string;
          requested_at: string;
          scheduled_for: string;
          status: Database["public"]["Enums"]["account_deletion_status"];
          subject_hash: string;
          user_id: string | null;
        };
        Insert: {
          completed_at?: string | null;
          expires_at?: string;
          failure_code?: string | null;
          id?: string;
          idempotency_key: string;
          requested_at?: string;
          scheduled_for?: string;
          status?: Database["public"]["Enums"]["account_deletion_status"];
          subject_hash: string;
          user_id?: string | null;
        };
        Update: {
          completed_at?: string | null;
          expires_at?: string;
          failure_code?: string | null;
          id?: string;
          idempotency_key?: string;
          requested_at?: string;
          scheduled_for?: string;
          status?: Database["public"]["Enums"]["account_deletion_status"];
          subject_hash?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      admin_audit_log: {
        Row: {
          action: string;
          admin_user_id: string | null;
          correlation_id: string | null;
          expires_at: string;
          id: number;
          metadata: Json;
          occurred_at: string;
          target_id: string | null;
          target_type: string;
        };
        Insert: {
          action: string;
          admin_user_id?: string | null;
          correlation_id?: string | null;
          expires_at?: string;
          id?: never;
          metadata?: Json;
          occurred_at?: string;
          target_id?: string | null;
          target_type: string;
        };
        Update: {
          action?: string;
          admin_user_id?: string | null;
          correlation_id?: string | null;
          expires_at?: string;
          id?: never;
          metadata?: Json;
          occurred_at?: string;
          target_id?: string | null;
          target_type?: string;
        };
        Relationships: [];
      };
      ai_generation_jobs: {
        Row: {
          attempt_count: number;
          completed_at: string | null;
          created_at: string;
          expires_at: string;
          id: string;
          idempotency_key: string;
          kind: Database["public"]["Enums"]["ai_job_kind"];
          model: string | null;
          prompt_version: string;
          provider: string | null;
          started_at: string | null;
          status: Database["public"]["Enums"]["ai_job_status"];
          updated_at: string;
          user_error_code: string | null;
          user_error_message: string | null;
          user_id: string | null;
        };
        Insert: {
          attempt_count?: number;
          completed_at?: string | null;
          created_at?: string;
          expires_at?: string;
          id?: string;
          idempotency_key: string;
          kind: Database["public"]["Enums"]["ai_job_kind"];
          model?: string | null;
          prompt_version: string;
          provider?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["ai_job_status"];
          updated_at?: string;
          user_error_code?: string | null;
          user_error_message?: string | null;
          user_id?: string | null;
        };
        Update: {
          attempt_count?: number;
          completed_at?: string | null;
          created_at?: string;
          expires_at?: string;
          id?: string;
          idempotency_key?: string;
          kind?: Database["public"]["Enums"]["ai_job_kind"];
          model?: string | null;
          prompt_version?: string;
          provider?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["ai_job_status"];
          updated_at?: string;
          user_error_code?: string | null;
          user_error_message?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ai_generation_jobs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      allergens: {
        Row: {
          code: string;
          created_at: string;
          eu_mandatory: boolean;
          id: string;
          name_fr: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          eu_mandatory?: boolean;
          id?: string;
          name_fr: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          eu_mandatory?: boolean;
          id?: string;
          name_fr?: string;
        };
        Relationships: [];
      };
      budget_preferences: {
        Row: {
          created_at: string;
          learned_from: Database["public"]["Enums"]["preference_source"];
          level: Database["public"]["Enums"]["budget_level"];
          max_cost_per_serving_eur: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          learned_from?: Database["public"]["Enums"]["preference_source"];
          level: Database["public"]["Enums"]["budget_level"];
          max_cost_per_serving_eur?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          learned_from?: Database["public"]["Enums"]["preference_source"];
          level?: Database["public"]["Enums"]["budget_level"];
          max_cost_per_serving_eur?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budget_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      content_reports: {
        Row: {
          assigned_admin_id: string | null;
          created_at: string;
          id: string;
          kind: Database["public"]["Enums"]["report_kind"];
          recipe_id: string | null;
          reporter_id: string | null;
          resolved_at: string | null;
          status: Database["public"]["Enums"]["report_status"];
          updated_at: string;
          user_message: string;
        };
        Insert: {
          assigned_admin_id?: string | null;
          created_at?: string;
          id?: string;
          kind: Database["public"]["Enums"]["report_kind"];
          recipe_id?: string | null;
          reporter_id?: string | null;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
          updated_at?: string;
          user_message: string;
        };
        Update: {
          assigned_admin_id?: string | null;
          created_at?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["report_kind"];
          recipe_id?: string | null;
          reporter_id?: string | null;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
          updated_at?: string;
          user_message?: string;
        };
        Relationships: [
          {
            foreignKeyName: "content_reports_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "content_reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      contextual_question_state: {
        Row: {
          answered_at: string | null;
          ask_count: number;
          last_asked_at: string | null;
          question_key: string;
          snoozed_until: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          answered_at?: string | null;
          ask_count?: number;
          last_asked_at?: string | null;
          question_key: string;
          snoozed_until?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          answered_at?: string | null;
          ask_count?: number;
          last_asked_at?: string | null;
          question_key?: string;
          snoozed_until?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contextual_question_state_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      cooked_recipes: {
        Row: {
          cooked_at: string;
          id: string;
          idempotency_key: string;
          planned_meal_id: string | null;
          recipe_version_id: string;
          servings: number;
          user_id: string;
        };
        Insert: {
          cooked_at?: string;
          id?: string;
          idempotency_key: string;
          planned_meal_id?: string | null;
          recipe_version_id: string;
          servings: number;
          user_id: string;
        };
        Update: {
          cooked_at?: string;
          id?: string;
          idempotency_key?: string;
          planned_meal_id?: string | null;
          recipe_version_id?: string;
          servings?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cooked_recipes_planned_meal_id_fkey";
            columns: ["planned_meal_id"];
            isOneToOne: false;
            referencedRelation: "planned_meals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cooked_recipes_recipe_version_id_fkey";
            columns: ["recipe_version_id"];
            isOneToOne: false;
            referencedRelation: "recipe_versions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cooked_recipes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      cuisine_preferences: {
        Row: {
          created_at: string;
          cuisine_code: string;
          learned_from: string;
          signal: Database["public"]["Enums"]["preference_signal"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          cuisine_code: string;
          learned_from?: string;
          signal: Database["public"]["Enums"]["preference_signal"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          cuisine_code?: string;
          learned_from?: string;
          signal?: Database["public"]["Enums"]["preference_signal"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cuisine_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      culinary_preferences: {
        Row: {
          cooking_skill: Database["public"]["Enums"]["cooking_skill"] | null;
          created_at: string;
          dietary_pattern:
            | Database["public"]["Enums"]["dietary_pattern"]
            | null;
          other_diet_label: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cooking_skill?: Database["public"]["Enums"]["cooking_skill"] | null;
          created_at?: string;
          dietary_pattern?:
            | Database["public"]["Enums"]["dietary_pattern"]
            | null;
          other_diet_label?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cooking_skill?: Database["public"]["Enums"]["cooking_skill"] | null;
          created_at?: string;
          dietary_pattern?:
            | Database["public"]["Enums"]["dietary_pattern"]
            | null;
          other_diet_label?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "culinary_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      data_retention_policies: {
        Row: {
          data_category: string;
          rationale: string;
          retention_days: number;
          updated_at: string;
        };
        Insert: {
          data_category: string;
          rationale: string;
          retention_days: number;
          updated_at?: string;
        };
        Update: {
          data_category?: string;
          rationale?: string;
          retention_days?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      duration_preferences: {
        Row: {
          created_at: string;
          learned_from: Database["public"]["Enums"]["preference_source"];
          max_cooking_minutes: number | null;
          max_preparation_minutes: number | null;
          max_total_minutes: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          learned_from?: Database["public"]["Enums"]["preference_source"];
          max_cooking_minutes?: number | null;
          max_preparation_minutes?: number | null;
          max_total_minutes?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          learned_from?: Database["public"]["Enums"]["preference_source"];
          max_cooking_minutes?: number | null;
          max_preparation_minutes?: number | null;
          max_total_minutes?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "duration_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      equipment: {
        Row: {
          code: string;
          created_at: string;
          id: string;
          name_fr: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: string;
          name_fr: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: string;
          name_fr?: string;
        };
        Relationships: [];
      };
      favorite_recipes: {
        Row: {
          created_at: string;
          recipe_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          recipe_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          recipe_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favorite_recipes_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorite_recipes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      ingredient_allergens: {
        Row: {
          allergen_id: string;
          created_at: string;
          ingredient_id: string;
          relation: string;
        };
        Insert: {
          allergen_id: string;
          created_at?: string;
          ingredient_id: string;
          relation?: string;
        };
        Update: {
          allergen_id?: string;
          created_at?: string;
          ingredient_id?: string;
          relation?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ingredient_allergens_allergen_id_fkey";
            columns: ["allergen_id"];
            isOneToOne: false;
            referencedRelation: "allergens";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ingredient_allergens_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
        ];
      };
      ingredient_corrections: {
        Row: {
          corrected_value: string;
          created_at: string;
          field_name: string;
          id: string;
          ingredient_id: string;
          previous_value: string | null;
          rationale: string;
          requested_by: string | null;
          source_url: string;
        };
        Insert: {
          corrected_value: string;
          created_at?: string;
          field_name: string;
          id?: string;
          ingredient_id: string;
          previous_value?: string | null;
          rationale: string;
          requested_by?: string | null;
          source_url: string;
        };
        Update: {
          corrected_value?: string;
          created_at?: string;
          field_name?: string;
          id?: string;
          ingredient_id?: string;
          previous_value?: string | null;
          rationale?: string;
          requested_by?: string | null;
          source_url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ingredient_corrections_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
        ];
      };
      ingredient_families: {
        Row: {
          code: string;
          created_at: string;
          id: string;
          name_fr: string;
          taxonomy_version_id: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: string;
          name_fr: string;
          taxonomy_version_id?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: string;
          name_fr?: string;
          taxonomy_version_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ingredient_families_taxonomy_version_id_fkey";
            columns: ["taxonomy_version_id"];
            isOneToOne: false;
            referencedRelation: "taxonomy_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      ingredient_relations: {
        Row: {
          child_ingredient_id: string;
          created_at: string;
          kind: Database["public"]["Enums"]["ingredient_relation_kind"];
          parent_ingredient_id: string;
        };
        Insert: {
          child_ingredient_id: string;
          created_at?: string;
          kind: Database["public"]["Enums"]["ingredient_relation_kind"];
          parent_ingredient_id: string;
        };
        Update: {
          child_ingredient_id?: string;
          created_at?: string;
          kind?: Database["public"]["Enums"]["ingredient_relation_kind"];
          parent_ingredient_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ingredient_relations_child_ingredient_id_fkey";
            columns: ["child_ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ingredient_relations_parent_ingredient_id_fkey";
            columns: ["parent_ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
        ];
      };
      ingredient_synonyms: {
        Row: {
          created_at: string;
          id: string;
          ingredient_id: string;
          name_fr: string;
          search_name: string | null;
          taxonomy_version_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          ingredient_id: string;
          name_fr: string;
          search_name?: string | null;
          taxonomy_version_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          ingredient_id?: string;
          name_fr?: string;
          search_name?: string | null;
          taxonomy_version_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ingredient_synonyms_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ingredient_synonyms_taxonomy_version_id_fkey";
            columns: ["taxonomy_version_id"];
            isOneToOne: false;
            referencedRelation: "taxonomy_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      ingredient_units: {
        Row: {
          ingredient_id: string;
          is_preferred: boolean;
          taxonomy_version_id: string;
          unit: string;
        };
        Insert: {
          ingredient_id: string;
          is_preferred?: boolean;
          taxonomy_version_id: string;
          unit: string;
        };
        Update: {
          ingredient_id?: string;
          is_preferred?: boolean;
          taxonomy_version_id?: string;
          unit?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ingredient_units_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ingredient_units_taxonomy_version_id_fkey";
            columns: ["taxonomy_version_id"];
            isOneToOne: false;
            referencedRelation: "taxonomy_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      ingredients: {
        Row: {
          ciqual_code: string | null;
          contains_alcohol: boolean;
          created_at: string;
          family_id: string | null;
          id: string;
          is_active: boolean;
          name_fr: string;
          parent_ingredient_id: string | null;
          search_name: string | null;
          slug: string;
          source_reference: string | null;
          taxonomy_version_id: string;
          updated_at: string;
        };
        Insert: {
          ciqual_code?: string | null;
          contains_alcohol?: boolean;
          created_at?: string;
          family_id?: string | null;
          id?: string;
          is_active?: boolean;
          name_fr: string;
          parent_ingredient_id?: string | null;
          search_name?: string | null;
          slug: string;
          source_reference?: string | null;
          taxonomy_version_id?: string;
          updated_at?: string;
        };
        Update: {
          ciqual_code?: string | null;
          contains_alcohol?: boolean;
          created_at?: string;
          family_id?: string | null;
          id?: string;
          is_active?: boolean;
          name_fr?: string;
          parent_ingredient_id?: string | null;
          search_name?: string | null;
          slug?: string;
          source_reference?: string | null;
          taxonomy_version_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ingredients_family_id_fkey";
            columns: ["family_id"];
            isOneToOne: false;
            referencedRelation: "ingredient_families";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ingredients_parent_ingredient_id_fkey";
            columns: ["parent_ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ingredients_taxonomy_version_id_fkey";
            columns: ["taxonomy_version_id"];
            isOneToOne: false;
            referencedRelation: "taxonomy_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      legal_document_versions: {
        Row: {
          content_hash: string;
          created_at: string;
          id: string;
          is_current: boolean;
          kind: Database["public"]["Enums"]["legal_document_kind"];
          published_at: string;
          requires_acceptance: boolean;
          title: string;
          version: string;
        };
        Insert: {
          content_hash: string;
          created_at?: string;
          id?: string;
          is_current?: boolean;
          kind: Database["public"]["Enums"]["legal_document_kind"];
          published_at: string;
          requires_acceptance?: boolean;
          title: string;
          version: string;
        };
        Update: {
          content_hash?: string;
          created_at?: string;
          id?: string;
          is_current?: boolean;
          kind?: Database["public"]["Enums"]["legal_document_kind"];
          published_at?: string;
          requires_acceptance?: boolean;
          title?: string;
          version?: string;
        };
        Relationships: [];
      };
      meal_plans: {
        Row: {
          created_at: string;
          generation_job_id: string | null;
          id: string;
          idempotency_key: string;
          status: Database["public"]["Enums"]["meal_plan_status"];
          updated_at: string;
          user_id: string;
          week_start: string;
        };
        Insert: {
          created_at?: string;
          generation_job_id?: string | null;
          id?: string;
          idempotency_key: string;
          status?: Database["public"]["Enums"]["meal_plan_status"];
          updated_at?: string;
          user_id: string;
          week_start: string;
        };
        Update: {
          created_at?: string;
          generation_job_id?: string | null;
          id?: string;
          idempotency_key?: string;
          status?: Database["public"]["Enums"]["meal_plan_status"];
          updated_at?: string;
          user_id?: string;
          week_start?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meal_plans_generation_job_id_fkey";
            columns: ["generation_job_id"];
            isOneToOne: false;
            referencedRelation: "ai_generation_jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meal_plans_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      onboarding_dish_preferences: {
        Row: {
          created_at: string;
          dish_id: string;
          learned_from: Database["public"]["Enums"]["preference_source"];
          signal: Database["public"]["Enums"]["preference_signal"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          dish_id: string;
          learned_from?: Database["public"]["Enums"]["preference_source"];
          signal: Database["public"]["Enums"]["preference_signal"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          dish_id?: string;
          learned_from?: Database["public"]["Enums"]["preference_source"];
          signal?: Database["public"]["Enums"]["preference_signal"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "onboarding_dish_preferences_dish_id_fkey";
            columns: ["dish_id"];
            isOneToOne: false;
            referencedRelation: "onboarding_dishes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "onboarding_dish_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      onboarding_dishes: {
        Row: {
          cuisine_code: string;
          description_fr: string;
          display_order: number;
          id: string;
          is_active: boolean;
          slug: string;
          title_fr: string;
        };
        Insert: {
          cuisine_code: string;
          description_fr: string;
          display_order: number;
          id: string;
          is_active?: boolean;
          slug: string;
          title_fr: string;
        };
        Update: {
          cuisine_code?: string;
          description_fr?: string;
          display_order?: number;
          id?: string;
          is_active?: boolean;
          slug?: string;
          title_fr?: string;
        };
        Relationships: [];
      };
      onboarding_events: {
        Row: {
          duration_bucket: string | null;
          event: Database["public"]["Enums"]["onboarding_event_kind"];
          expires_at: string;
          id: number;
          occurred_at: string;
          step: Database["public"]["Enums"]["onboarding_step_key"];
          user_id: string;
        };
        Insert: {
          duration_bucket?: string | null;
          event: Database["public"]["Enums"]["onboarding_event_kind"];
          expires_at?: string;
          id?: never;
          occurred_at?: string;
          step: Database["public"]["Enums"]["onboarding_step_key"];
          user_id: string;
        };
        Update: {
          duration_bucket?: string | null;
          event?: Database["public"]["Enums"]["onboarding_event_kind"];
          expires_at?: string;
          id?: never;
          occurred_at?: string;
          step?: Database["public"]["Enums"]["onboarding_step_key"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "onboarding_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      onboarding_steps: {
        Row: {
          completed_at: string | null;
          data_version: number;
          skipped_at: string | null;
          step: Database["public"]["Enums"]["onboarding_step_key"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          data_version?: number;
          skipped_at?: string | null;
          step: Database["public"]["Enums"]["onboarding_step_key"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          data_version?: number;
          skipped_at?: string | null;
          step?: Database["public"]["Enums"]["onboarding_step_key"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "onboarding_steps_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      planned_meals: {
        Row: {
          cooked_at: string | null;
          created_at: string;
          id: string;
          is_locked: boolean;
          meal_date: string;
          meal_plan_id: string;
          meal_type: Database["public"]["Enums"]["meal_type"];
          recipe_version_id: string | null;
          servings: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cooked_at?: string | null;
          created_at?: string;
          id?: string;
          is_locked?: boolean;
          meal_date: string;
          meal_plan_id: string;
          meal_type: Database["public"]["Enums"]["meal_type"];
          recipe_version_id?: string | null;
          servings: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cooked_at?: string | null;
          created_at?: string;
          id?: string;
          is_locked?: boolean;
          meal_date?: string;
          meal_plan_id?: string;
          meal_type?: Database["public"]["Enums"]["meal_type"];
          recipe_version_id?: string | null;
          servings?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "planned_meals_meal_plan_id_user_id_fkey";
            columns: ["meal_plan_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "meal_plans";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "planned_meals_recipe_version_id_fkey";
            columns: ["recipe_version_id"];
            isOneToOne: false;
            referencedRelation: "recipe_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          birth_date: string;
          country_code: string;
          created_at: string;
          first_name: string;
          food_safety_confirmed_at: string | null;
          id: string;
          last_name: string;
          meals_per_week: number;
          nutrition_goal: Database["public"]["Enums"]["nutrition_goal"];
          onboarding_completed_at: string | null;
          onboarding_status: Database["public"]["Enums"]["onboarding_status"];
          servings_per_meal: number;
          updated_at: string;
        };
        Insert: {
          birth_date: string;
          country_code?: string;
          created_at?: string;
          first_name: string;
          food_safety_confirmed_at?: string | null;
          id: string;
          last_name: string;
          meals_per_week?: number;
          nutrition_goal?: Database["public"]["Enums"]["nutrition_goal"];
          onboarding_completed_at?: string | null;
          onboarding_status?: Database["public"]["Enums"]["onboarding_status"];
          servings_per_meal?: number;
          updated_at?: string;
        };
        Update: {
          birth_date?: string;
          country_code?: string;
          created_at?: string;
          first_name?: string;
          food_safety_confirmed_at?: string | null;
          id?: string;
          last_name?: string;
          meals_per_week?: number;
          nutrition_goal?: Database["public"]["Enums"]["nutrition_goal"];
          onboarding_completed_at?: string | null;
          onboarding_status?: Database["public"]["Enums"]["onboarding_status"];
          servings_per_meal?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      recipe_categories: {
        Row: {
          created_at: string;
          id: string;
          name_fr: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name_fr: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name_fr?: string;
          slug?: string;
        };
        Relationships: [];
      };
      recipe_category_assignments: {
        Row: {
          category_id: string;
          recipe_id: string;
        };
        Insert: {
          category_id: string;
          recipe_id: string;
        };
        Update: {
          category_id?: string;
          recipe_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_category_assignments_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "recipe_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_category_assignments_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_images: {
        Row: {
          alt_text: string | null;
          created_at: string;
          failure_code: string | null;
          height: number | null;
          id: string;
          is_primary: boolean;
          model: string | null;
          prompt_version: string | null;
          provider: string | null;
          recipe_version_id: string;
          status: Database["public"]["Enums"]["recipe_image_status"];
          storage_bucket: string;
          storage_path: string | null;
          updated_at: string;
          width: number | null;
        };
        Insert: {
          alt_text?: string | null;
          created_at?: string;
          failure_code?: string | null;
          height?: number | null;
          id?: string;
          is_primary?: boolean;
          model?: string | null;
          prompt_version?: string | null;
          provider?: string | null;
          recipe_version_id: string;
          status?: Database["public"]["Enums"]["recipe_image_status"];
          storage_bucket?: string;
          storage_path?: string | null;
          updated_at?: string;
          width?: number | null;
        };
        Update: {
          alt_text?: string | null;
          created_at?: string;
          failure_code?: string | null;
          height?: number | null;
          id?: string;
          is_primary?: boolean;
          model?: string | null;
          prompt_version?: string | null;
          provider?: string | null;
          recipe_version_id?: string;
          status?: Database["public"]["Enums"]["recipe_image_status"];
          storage_bucket?: string;
          storage_path?: string | null;
          updated_at?: string;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_images_recipe_version_id_fkey";
            columns: ["recipe_version_id"];
            isOneToOne: false;
            referencedRelation: "recipe_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_ingredients: {
        Row: {
          created_at: string;
          id: string;
          ingredient_id: string;
          optional: boolean;
          position: number;
          preparation_note: string | null;
          quantity: number | null;
          recipe_version_id: string;
          unit: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          ingredient_id: string;
          optional?: boolean;
          position: number;
          preparation_note?: string | null;
          quantity?: number | null;
          recipe_version_id: string;
          unit?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          ingredient_id?: string;
          optional?: boolean;
          position?: number;
          preparation_note?: string | null;
          quantity?: number | null;
          recipe_version_id?: string;
          unit?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_version_id_fkey";
            columns: ["recipe_version_id"];
            isOneToOne: false;
            referencedRelation: "recipe_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_nutrition: {
        Row: {
          calculated_at: string;
          calories_kcal: number;
          carbohydrates_g: number;
          created_at: string;
          fat_g: number;
          fiber_g: number | null;
          protein_g: number;
          recipe_version_id: string;
          salt_g: number | null;
          source: string;
          source_version: string;
          tolerance_percent: number;
          updated_at: string;
        };
        Insert: {
          calculated_at?: string;
          calories_kcal: number;
          carbohydrates_g: number;
          created_at?: string;
          fat_g: number;
          fiber_g?: number | null;
          protein_g: number;
          recipe_version_id: string;
          salt_g?: number | null;
          source?: string;
          source_version: string;
          tolerance_percent?: number;
          updated_at?: string;
        };
        Update: {
          calculated_at?: string;
          calories_kcal?: number;
          carbohydrates_g?: number;
          created_at?: string;
          fat_g?: number;
          fiber_g?: number | null;
          protein_g?: number;
          recipe_version_id?: string;
          salt_g?: number | null;
          source?: string;
          source_version?: string;
          tolerance_percent?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_nutrition_recipe_version_id_fkey";
            columns: ["recipe_version_id"];
            isOneToOne: true;
            referencedRelation: "recipe_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_reaction_events: {
        Row: {
          id: string;
          idempotency_key: string;
          occurred_at: string;
          reaction: Database["public"]["Enums"]["recipe_reaction_kind"];
          reason: Database["public"]["Enums"]["dislike_reason"] | null;
          recipe_id: string;
          source: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          idempotency_key: string;
          occurred_at?: string;
          reaction: Database["public"]["Enums"]["recipe_reaction_kind"];
          reason?: Database["public"]["Enums"]["dislike_reason"] | null;
          recipe_id: string;
          source?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          idempotency_key?: string;
          occurred_at?: string;
          reaction?: Database["public"]["Enums"]["recipe_reaction_kind"];
          reason?: Database["public"]["Enums"]["dislike_reason"] | null;
          recipe_id?: string;
          source?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_reaction_events_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_reaction_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_reactions: {
        Row: {
          created_at: string;
          id: string;
          idempotency_key: string;
          reaction: Database["public"]["Enums"]["recipe_reaction_kind"];
          reason: Database["public"]["Enums"]["dislike_reason"] | null;
          recipe_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          idempotency_key: string;
          reaction: Database["public"]["Enums"]["recipe_reaction_kind"];
          reason?: Database["public"]["Enums"]["dislike_reason"] | null;
          recipe_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          idempotency_key?: string;
          reaction?: Database["public"]["Enums"]["recipe_reaction_kind"];
          reason?: Database["public"]["Enums"]["dislike_reason"] | null;
          recipe_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_reactions_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_reactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_steps: {
        Row: {
          created_at: string;
          id: string;
          instruction: string;
          position: number;
          recipe_version_id: string;
          timer_seconds: number | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          instruction: string;
          position: number;
          recipe_version_id: string;
          timer_seconds?: number | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          instruction?: string;
          position?: number;
          recipe_version_id?: string;
          timer_seconds?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_steps_recipe_version_id_fkey";
            columns: ["recipe_version_id"];
            isOneToOne: false;
            referencedRelation: "recipe_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_swaps: {
        Row: {
          completed_at: string | null;
          from_recipe_version_id: string;
          id: string;
          idempotency_key: string;
          planned_meal_id: string;
          reason: Database["public"]["Enums"]["dislike_reason"] | null;
          request_summary: string | null;
          requested_at: string;
          status: Database["public"]["Enums"]["swap_status"];
          to_recipe_version_id: string | null;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          from_recipe_version_id: string;
          id?: string;
          idempotency_key: string;
          planned_meal_id: string;
          reason?: Database["public"]["Enums"]["dislike_reason"] | null;
          request_summary?: string | null;
          requested_at?: string;
          status?: Database["public"]["Enums"]["swap_status"];
          to_recipe_version_id?: string | null;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          from_recipe_version_id?: string;
          id?: string;
          idempotency_key?: string;
          planned_meal_id?: string;
          reason?: Database["public"]["Enums"]["dislike_reason"] | null;
          request_summary?: string | null;
          requested_at?: string;
          status?: Database["public"]["Enums"]["swap_status"];
          to_recipe_version_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_swaps_from_recipe_version_id_fkey";
            columns: ["from_recipe_version_id"];
            isOneToOne: false;
            referencedRelation: "recipe_versions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_swaps_planned_meal_id_user_id_fkey";
            columns: ["planned_meal_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "planned_meals";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "recipe_swaps_to_recipe_version_id_fkey";
            columns: ["to_recipe_version_id"];
            isOneToOne: false;
            referencedRelation: "recipe_versions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_swaps_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_tag_assignments: {
        Row: {
          recipe_id: string;
          tag_id: string;
        };
        Insert: {
          recipe_id: string;
          tag_id: string;
        };
        Update: {
          recipe_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_tag_assignments_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_tag_assignments_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "recipe_tags";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_tags: {
        Row: {
          created_at: string;
          id: string;
          name_fr: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name_fr: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name_fr?: string;
          slug?: string;
        };
        Relationships: [];
      };
      recipe_versions: {
        Row: {
          ai_model: string | null;
          ai_provider: string | null;
          cooking_minutes: number;
          cost_level: Database["public"]["Enums"]["recipe_cost_level"] | null;
          created_at: string;
          description: string;
          difficulty: Database["public"]["Enums"]["recipe_difficulty"];
          estimated_cost_eur: number | null;
          id: string;
          origin: Database["public"]["Enums"]["recipe_origin"];
          preparation_minutes: number;
          prompt_version: string | null;
          publication_status: Database["public"]["Enums"]["recipe_publication_status"];
          published_at: string | null;
          recipe_id: string;
          resting_minutes: number;
          servings: number;
          title: string;
          updated_at: string;
          validated_at: string | null;
          validation_notes: string | null;
          validation_status: Database["public"]["Enums"]["recipe_validation_status"];
          version_number: number;
        };
        Insert: {
          ai_model?: string | null;
          ai_provider?: string | null;
          cooking_minutes: number;
          cost_level?: Database["public"]["Enums"]["recipe_cost_level"] | null;
          created_at?: string;
          description: string;
          difficulty: Database["public"]["Enums"]["recipe_difficulty"];
          estimated_cost_eur?: number | null;
          id?: string;
          origin: Database["public"]["Enums"]["recipe_origin"];
          preparation_minutes: number;
          prompt_version?: string | null;
          publication_status?: Database["public"]["Enums"]["recipe_publication_status"];
          published_at?: string | null;
          recipe_id: string;
          resting_minutes?: number;
          servings: number;
          title: string;
          updated_at?: string;
          validated_at?: string | null;
          validation_notes?: string | null;
          validation_status?: Database["public"]["Enums"]["recipe_validation_status"];
          version_number: number;
        };
        Update: {
          ai_model?: string | null;
          ai_provider?: string | null;
          cooking_minutes?: number;
          cost_level?: Database["public"]["Enums"]["recipe_cost_level"] | null;
          created_at?: string;
          description?: string;
          difficulty?: Database["public"]["Enums"]["recipe_difficulty"];
          estimated_cost_eur?: number | null;
          id?: string;
          origin?: Database["public"]["Enums"]["recipe_origin"];
          preparation_minutes?: number;
          prompt_version?: string | null;
          publication_status?: Database["public"]["Enums"]["recipe_publication_status"];
          published_at?: string | null;
          recipe_id?: string;
          resting_minutes?: number;
          servings?: number;
          title?: string;
          updated_at?: string;
          validated_at?: string | null;
          validation_notes?: string | null;
          validation_status?: Database["public"]["Enums"]["recipe_validation_status"];
          version_number?: number;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_versions_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
        ];
      };
      recipes: {
        Row: {
          canonical_slug: string;
          created_at: string;
          created_by: string | null;
          deduplication_hash: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          canonical_slug: string;
          created_at?: string;
          created_by?: string | null;
          deduplication_hash: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          canonical_slug?: string;
          created_at?: string;
          created_by?: string | null;
          deduplication_hash?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      shopping_list_items: {
        Row: {
          aisle: string | null;
          checked_at: string | null;
          created_at: string;
          id: string;
          ingredient_id: string | null;
          manual_label: string | null;
          quantity: number | null;
          shopping_list_id: string;
          source_recipe_version_id: string | null;
          unit: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          aisle?: string | null;
          checked_at?: string | null;
          created_at?: string;
          id?: string;
          ingredient_id?: string | null;
          manual_label?: string | null;
          quantity?: number | null;
          shopping_list_id: string;
          source_recipe_version_id?: string | null;
          unit?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          aisle?: string | null;
          checked_at?: string | null;
          created_at?: string;
          id?: string;
          ingredient_id?: string | null;
          manual_label?: string | null;
          quantity?: number | null;
          shopping_list_id?: string;
          source_recipe_version_id?: string | null;
          unit?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_list_items_shopping_list_id_user_id_fkey";
            columns: ["shopping_list_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "shopping_lists";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "shopping_list_items_source_recipe_version_id_fkey";
            columns: ["source_recipe_version_id"];
            isOneToOne: false;
            referencedRelation: "recipe_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      shopping_lists: {
        Row: {
          created_at: string;
          id: string;
          idempotency_key: string;
          meal_plan_id: string | null;
          status: Database["public"]["Enums"]["shopping_list_status"];
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          idempotency_key: string;
          meal_plan_id?: string | null;
          status?: Database["public"]["Enums"]["shopping_list_status"];
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          idempotency_key?: string;
          meal_plan_id?: string | null;
          status?: Database["public"]["Enums"]["shopping_list_status"];
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_lists_meal_plan_id_fkey";
            columns: ["meal_plan_id"];
            isOneToOne: false;
            referencedRelation: "meal_plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_lists_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      taxonomy_versions: {
        Row: {
          id: string;
          imported_at: string;
          is_current: boolean;
          locale: string;
          source_checked_at: string;
          source_name: string;
          source_url: string;
          version: string;
        };
        Insert: {
          id: string;
          imported_at?: string;
          is_current?: boolean;
          locale?: string;
          source_checked_at: string;
          source_name: string;
          source_url: string;
          version: string;
        };
        Update: {
          id?: string;
          imported_at?: string;
          is_current?: boolean;
          locale?: string;
          source_checked_at?: string;
          source_name?: string;
          source_url?: string;
          version?: string;
        };
        Relationships: [];
      };
      usage_quotas: {
        Row: {
          limit_count: number;
          quota_key: string;
          updated_at: string;
          used_count: number;
          user_id: string;
          window_end: string;
          window_start: string;
        };
        Insert: {
          limit_count: number;
          quota_key: string;
          updated_at?: string;
          used_count?: number;
          user_id: string;
          window_end: string;
          window_start: string;
        };
        Update: {
          limit_count?: number;
          quota_key?: string;
          updated_at?: string;
          used_count?: number;
          user_id?: string;
          window_end?: string;
          window_start?: string;
        };
        Relationships: [
          {
            foreignKeyName: "usage_quotas_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_equipment: {
        Row: {
          available: boolean;
          created_at: string;
          equipment_id: string;
          learned_from: Database["public"]["Enums"]["preference_source"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          available?: boolean;
          created_at?: string;
          equipment_id: string;
          learned_from?: Database["public"]["Enums"]["preference_source"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          available?: boolean;
          created_at?: string;
          equipment_id?: string;
          learned_from?: Database["public"]["Enums"]["preference_source"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_equipment_equipment_id_fkey";
            columns: ["equipment_id"];
            isOneToOne: false;
            referencedRelation: "equipment";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_equipment_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_food_constraints: {
        Row: {
          allergen_id: string | null;
          created_at: string;
          id: string;
          ingredient_id: string | null;
          is_absolute: boolean;
          kind: Database["public"]["Enums"]["food_constraint_kind"];
          note: string | null;
          severity: Database["public"]["Enums"]["constraint_severity"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          allergen_id?: string | null;
          created_at?: string;
          id?: string;
          ingredient_id?: string | null;
          is_absolute: boolean;
          kind: Database["public"]["Enums"]["food_constraint_kind"];
          note?: string | null;
          severity?: Database["public"]["Enums"]["constraint_severity"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          allergen_id?: string | null;
          created_at?: string;
          id?: string;
          ingredient_id?: string | null;
          is_absolute?: boolean;
          kind?: Database["public"]["Enums"]["food_constraint_kind"];
          note?: string | null;
          severity?: Database["public"]["Enums"]["constraint_severity"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_food_constraints_allergen_id_fkey";
            columns: ["allergen_id"];
            isOneToOne: false;
            referencedRelation: "allergens";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_food_constraints_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_food_constraints_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_ingredient_preferences: {
        Row: {
          created_at: string;
          ingredient_id: string;
          learned_from: Database["public"]["Enums"]["preference_source"];
          signal: Database["public"]["Enums"]["preference_signal"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          ingredient_id: string;
          learned_from?: Database["public"]["Enums"]["preference_source"];
          signal: Database["public"]["Enums"]["preference_signal"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          ingredient_id?: string;
          learned_from?: Database["public"]["Enums"]["preference_source"];
          signal?: Database["public"]["Enums"]["preference_signal"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_ingredient_preferences_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_ingredient_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_legal_consents: {
        Row: {
          accepted_at: string;
          created_at: string;
          document_version_id: string;
          id: string;
          source: string;
          subject_hash: string;
          user_id: string | null;
          withdrawn_at: string | null;
        };
        Insert: {
          accepted_at?: string;
          created_at?: string;
          document_version_id: string;
          id?: string;
          source: string;
          subject_hash: string;
          user_id?: string | null;
          withdrawn_at?: string | null;
        };
        Update: {
          accepted_at?: string;
          created_at?: string;
          document_version_id?: string;
          id?: string;
          source?: string;
          subject_hash?: string;
          user_id?: string | null;
          withdrawn_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_legal_consents_document_version_id_fkey";
            columns: ["document_version_id"];
            isOneToOne: false;
            referencedRelation: "legal_document_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          granted_at: string;
          granted_by: string | null;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          granted_at?: string;
          granted_by?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          granted_at?: string;
          granted_by?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      admin_ai_attempts: {
        Row: {
          attempt_number: number | null;
          created_at: string | null;
          duration_ms: number | null;
          estimated_cost_usd: number | null;
          id: string | null;
          image_count: number | null;
          input_tokens: number | null;
          job_id: string | null;
          model: string | null;
          output_tokens: number | null;
          provider: string | null;
          technical_error_code: string | null;
        };
        Insert: {
          attempt_number?: number | null;
          created_at?: string | null;
          duration_ms?: number | null;
          estimated_cost_usd?: number | null;
          id?: string | null;
          image_count?: number | null;
          input_tokens?: number | null;
          job_id?: string | null;
          model?: string | null;
          output_tokens?: number | null;
          provider?: string | null;
          technical_error_code?: string | null;
        };
        Update: {
          attempt_number?: number | null;
          created_at?: string | null;
          duration_ms?: number | null;
          estimated_cost_usd?: number | null;
          id?: string | null;
          image_count?: number | null;
          input_tokens?: number | null;
          job_id?: string | null;
          model?: string | null;
          output_tokens?: number | null;
          provider?: string | null;
          technical_error_code?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ai_generation_attempts_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "ai_generation_jobs";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      complete_food_safety_onboarding: {
        Args: { p_constraints: Json; p_no_constraints: boolean };
        Returns: undefined;
      };
      complete_goals_onboarding: {
        Args: {
          p_meals_per_week: number;
          p_nutrition_goal: Database["public"]["Enums"]["nutrition_goal"];
          p_servings_per_meal: number;
        };
        Returns: undefined;
      };
      complete_tastes_and_request_plan: {
        Args: {
          p_idempotency_key: string;
          p_liked_dish_ids: string[];
          p_skipped: boolean;
        };
        Returns: string;
      };
      consume_auth_rate_limit: {
        Args: { p_action: string; p_identifier_hash: string };
        Returns: boolean;
      };
      correct_ingredient: {
        Args: {
          p_corrected_value: string;
          p_field_name: string;
          p_ingredient_id: string;
          p_rationale: string;
          p_source_url: string;
        };
        Returns: undefined;
      };
      export_my_account: { Args: never; Returns: Json };
      normalize_search_term: { Args: { value: string }; Returns: string };
      request_account_deletion: {
        Args: { p_confirmation: string; p_idempotency_key: string };
        Returns: string;
      };
      save_progressive_profile: {
        Args: {
          p_budget_level: Database["public"]["Enums"]["budget_level"];
          p_cooking_skill: Database["public"]["Enums"]["cooking_skill"];
          p_cuisine_codes: string[];
          p_dietary_pattern: Database["public"]["Enums"]["dietary_pattern"];
          p_equipment_ids: string[];
          p_ingredient_preferences: Json;
          p_max_preparation_minutes: number;
        };
        Returns: undefined;
      };
    };
    Enums: {
      account_deletion_status:
        | "requested"
        | "processing"
        | "completed"
        | "failed";
      ai_job_kind: "meal_plan" | "recipe" | "recipe_swap" | "recipe_image";
      ai_job_status:
        | "queued"
        | "running"
        | "succeeded"
        | "failed"
        | "cancelled";
      app_role: "user" | "admin";
      budget_level: "low" | "moderate" | "flexible";
      constraint_severity:
        | "none"
        | "mild"
        | "moderate"
        | "severe"
        | "life_threatening";
      cooking_skill: "beginner" | "intermediate" | "advanced";
      dietary_pattern:
        | "omnivore"
        | "vegetarian"
        | "vegan"
        | "pescatarian"
        | "pork_free"
        | "other";
      dislike_reason:
        | "ingredient"
        | "too_long"
        | "too_complex"
        | "too_expensive"
        | "recently_eaten"
        | "dish_type"
        | "other";
      food_constraint_kind:
        | "allergy"
        | "intolerance"
        | "strict_exclusion"
        | "negative_preference";
      ingredient_relation_kind: "derived_from" | "contains";
      legal_document_kind:
        | "privacy_policy"
        | "terms"
        | "legal_notice"
        | "cookie_policy"
        | "nutrition_disclaimer"
        | "food_safety_notice";
      meal_plan_status: "draft" | "generating" | "ready" | "archived";
      meal_type: "lunch" | "dinner";
      nutrition_goal:
        | "weight_loss"
        | "balanced"
        | "muscle_gain"
        | "no_specific_goal";
      onboarding_event_kind: "viewed" | "completed" | "skipped" | "abandoned";
      onboarding_status:
        | "account_created"
        | "food_safety_completed"
        | "goals_completed"
        | "initial_tastes_completed"
        | "completed";
      onboarding_step_key:
        | "account"
        | "food_safety"
        | "goals"
        | "initial_tastes"
        | "first_generation";
      preference_signal: "liked" | "disliked";
      preference_source: "explicit" | "interaction" | "inferred";
      recipe_cost_level: "low" | "moderate" | "high";
      recipe_difficulty: "easy" | "medium" | "advanced";
      recipe_image_status:
        | "pending"
        | "generating"
        | "ready"
        | "failed"
        | "rejected";
      recipe_origin: "editorial" | "ai_generated" | "user";
      recipe_publication_status:
        | "private"
        | "unlisted"
        | "published"
        | "archived";
      recipe_reaction_kind: "like" | "dislike";
      recipe_validation_status: "draft" | "pending" | "validated" | "rejected";
      report_kind: "food_safety" | "recipe_error" | "image" | "other";
      report_status: "open" | "investigating" | "resolved" | "dismissed";
      shopping_list_status: "draft" | "active" | "completed" | "archived";
      swap_status: "requested" | "completed" | "failed" | "cancelled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      account_deletion_status: [
        "requested",
        "processing",
        "completed",
        "failed",
      ],
      ai_job_kind: ["meal_plan", "recipe", "recipe_swap", "recipe_image"],
      ai_job_status: ["queued", "running", "succeeded", "failed", "cancelled"],
      app_role: ["user", "admin"],
      budget_level: ["low", "moderate", "flexible"],
      constraint_severity: [
        "none",
        "mild",
        "moderate",
        "severe",
        "life_threatening",
      ],
      cooking_skill: ["beginner", "intermediate", "advanced"],
      dietary_pattern: [
        "omnivore",
        "vegetarian",
        "vegan",
        "pescatarian",
        "pork_free",
        "other",
      ],
      dislike_reason: [
        "ingredient",
        "too_long",
        "too_complex",
        "too_expensive",
        "recently_eaten",
        "dish_type",
        "other",
      ],
      food_constraint_kind: [
        "allergy",
        "intolerance",
        "strict_exclusion",
        "negative_preference",
      ],
      ingredient_relation_kind: ["derived_from", "contains"],
      legal_document_kind: [
        "privacy_policy",
        "terms",
        "legal_notice",
        "cookie_policy",
        "nutrition_disclaimer",
        "food_safety_notice",
      ],
      meal_plan_status: ["draft", "generating", "ready", "archived"],
      meal_type: ["lunch", "dinner"],
      nutrition_goal: [
        "weight_loss",
        "balanced",
        "muscle_gain",
        "no_specific_goal",
      ],
      onboarding_event_kind: ["viewed", "completed", "skipped", "abandoned"],
      onboarding_status: [
        "account_created",
        "food_safety_completed",
        "goals_completed",
        "initial_tastes_completed",
        "completed",
      ],
      onboarding_step_key: [
        "account",
        "food_safety",
        "goals",
        "initial_tastes",
        "first_generation",
      ],
      preference_signal: ["liked", "disliked"],
      preference_source: ["explicit", "interaction", "inferred"],
      recipe_cost_level: ["low", "moderate", "high"],
      recipe_difficulty: ["easy", "medium", "advanced"],
      recipe_image_status: [
        "pending",
        "generating",
        "ready",
        "failed",
        "rejected",
      ],
      recipe_origin: ["editorial", "ai_generated", "user"],
      recipe_publication_status: [
        "private",
        "unlisted",
        "published",
        "archived",
      ],
      recipe_reaction_kind: ["like", "dislike"],
      recipe_validation_status: ["draft", "pending", "validated", "rejected"],
      report_kind: ["food_safety", "recipe_error", "image", "other"],
      report_status: ["open", "investigating", "resolved", "dismissed"],
      shopping_list_status: ["draft", "active", "completed", "archived"],
      swap_status: ["requested", "completed", "failed", "cancelled"],
    },
  },
} as const;
