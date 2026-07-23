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
        Relationships: [
          {
            foreignKeyName: "account_deletion_requests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "admin_user_directory";
            referencedColumns: ["id"];
          },
        ];
      };
      account_states: {
        Row: {
          reason: string | null;
          status: Database["public"]["Enums"]["account_state_kind"];
          suspended_at: string | null;
          suspended_by: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          reason?: string | null;
          status?: Database["public"]["Enums"]["account_state_kind"];
          suspended_at?: string | null;
          suspended_by?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          reason?: string | null;
          status?: Database["public"]["Enums"]["account_state_kind"];
          suspended_at?: string | null;
          suspended_by?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "account_states_suspended_by_fkey";
            columns: ["suspended_by"];
            isOneToOne: false;
            referencedRelation: "admin_user_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "account_states_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "admin_user_directory";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_audit_log: {
        Row: {
          action: string;
          admin_user_id: string | null;
          correlation_id: string | null;
          expires_at: string;
          id: number;
          idempotency_key: string | null;
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
          idempotency_key?: string | null;
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
          idempotency_key?: string | null;
          metadata?: Json;
          occurred_at?: string;
          target_id?: string | null;
          target_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_user_id_fkey";
            columns: ["admin_user_id"];
            isOneToOne: false;
            referencedRelation: "admin_user_directory";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_generation_job_recipes: {
        Row: {
          created_at: string;
          job_id: string;
          position: number;
          recipe_id: string;
        };
        Insert: {
          created_at?: string;
          job_id: string;
          position: number;
          recipe_id: string;
        };
        Update: {
          created_at?: string;
          job_id?: string;
          position?: number;
          recipe_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_generation_job_recipes_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "ai_generation_jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ai_generation_job_recipes_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_generation_jobs: {
        Row: {
          attempt_count: number;
          completed_at: string | null;
          created_at: string;
          degraded_mode: string | null;
          expires_at: string;
          id: string;
          idempotency_key: string;
          kind: Database["public"]["Enums"]["ai_job_kind"];
          model: string | null;
          progress_percent: number;
          progress_stage: string;
          prompt_version: string;
          provider: string | null;
          request_payload: Json;
          result_recipe_ids: string[];
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
          degraded_mode?: string | null;
          expires_at?: string;
          id?: string;
          idempotency_key: string;
          kind: Database["public"]["Enums"]["ai_job_kind"];
          model?: string | null;
          progress_percent?: number;
          progress_stage?: string;
          prompt_version: string;
          provider?: string | null;
          request_payload?: Json;
          result_recipe_ids?: string[];
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
          degraded_mode?: string | null;
          expires_at?: string;
          id?: string;
          idempotency_key?: string;
          kind?: Database["public"]["Enums"]["ai_job_kind"];
          model?: string | null;
          progress_percent?: number;
          progress_stage?: string;
          prompt_version?: string;
          provider?: string | null;
          request_payload?: Json;
          result_recipe_ids?: string[];
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
      blocked_food_rules: {
        Row: {
          active: boolean;
          created_at: string;
          created_by: string;
          id: string;
          ingredient_id: string;
          paired_ingredient_id: string | null;
          reason: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          created_by: string;
          id?: string;
          ingredient_id: string;
          paired_ingredient_id?: string | null;
          reason: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          created_by?: string;
          id?: string;
          ingredient_id?: string;
          paired_ingredient_id?: string | null;
          reason?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blocked_food_rules_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_user_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "blocked_food_rules_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "blocked_food_rules_paired_ingredient_id_fkey";
            columns: ["paired_ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
        ];
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
      ciqual_constituents: {
        Row: {
          code: string;
          created_at: string;
          displayed: boolean;
          infoods_tag: string | null;
          name_fr: string;
          source_column: number;
          source_version_id: string;
          unit: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          displayed?: boolean;
          infoods_tag?: string | null;
          name_fr: string;
          source_column: number;
          source_version_id: string;
          unit: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          displayed?: boolean;
          infoods_tag?: string | null;
          name_fr?: string;
          source_column?: number;
          source_version_id?: string;
          unit?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ciqual_constituents_source_version_id_fkey";
            columns: ["source_version_id"];
            isOneToOne: false;
            referencedRelation: "nutrition_source_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      ciqual_foods: {
        Row: {
          code: string;
          created_at: string;
          group_code: string;
          group_name_fr: string | null;
          name_fr: string;
          scientific_name: string | null;
          search_name: string | null;
          source_version_id: string;
          subgroup_code: string;
          subgroup_name_fr: string | null;
          subsubgroup_code: string;
          subsubgroup_name_fr: string | null;
        };
        Insert: {
          code: string;
          created_at?: string;
          group_code: string;
          group_name_fr?: string | null;
          name_fr: string;
          scientific_name?: string | null;
          search_name?: string | null;
          source_version_id: string;
          subgroup_code: string;
          subgroup_name_fr?: string | null;
          subsubgroup_code: string;
          subsubgroup_name_fr?: string | null;
        };
        Update: {
          code?: string;
          created_at?: string;
          group_code?: string;
          group_name_fr?: string | null;
          name_fr?: string;
          scientific_name?: string | null;
          search_name?: string | null;
          source_version_id?: string;
          subgroup_code?: string;
          subgroup_name_fr?: string | null;
          subsubgroup_code?: string;
          subsubgroup_name_fr?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ciqual_foods_source_version_id_fkey";
            columns: ["source_version_id"];
            isOneToOne: false;
            referencedRelation: "nutrition_source_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      ciqual_nutrient_values: {
        Row: {
          constituent_code: string;
          created_at: string;
          food_code: string;
          numeric_value: number | null;
          raw_value: string;
          source_version_id: string;
          upper_bound: number | null;
          value_status: Database["public"]["Enums"]["ciqual_value_status"];
        };
        Insert: {
          constituent_code: string;
          created_at?: string;
          food_code: string;
          numeric_value?: number | null;
          raw_value: string;
          source_version_id: string;
          upper_bound?: number | null;
          value_status: Database["public"]["Enums"]["ciqual_value_status"];
        };
        Update: {
          constituent_code?: string;
          created_at?: string;
          food_code?: string;
          numeric_value?: number | null;
          raw_value?: string;
          source_version_id?: string;
          upper_bound?: number | null;
          value_status?: Database["public"]["Enums"]["ciqual_value_status"];
        };
        Relationships: [
          {
            foreignKeyName: "ciqual_nutrient_values_source_version_id_constituent_code_fkey";
            columns: ["source_version_id", "constituent_code"];
            isOneToOne: false;
            referencedRelation: "ciqual_constituents";
            referencedColumns: ["source_version_id", "code"];
          },
          {
            foreignKeyName: "ciqual_nutrient_values_source_version_id_food_code_fkey";
            columns: ["source_version_id", "food_code"];
            isOneToOne: false;
            referencedRelation: "ciqual_foods";
            referencedColumns: ["source_version_id", "code"];
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
            foreignKeyName: "content_reports_assigned_admin_id_fkey";
            columns: ["assigned_admin_id"];
            isOneToOne: false;
            referencedRelation: "admin_user_directory";
            referencedColumns: ["id"];
          },
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
      cooking_sessions: {
        Row: {
          checked_steps: number[];
          recipe_version_id: string;
          requested_servings: number;
          timer_ends_at: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          checked_steps?: number[];
          recipe_version_id: string;
          requested_servings: number;
          timer_ends_at?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          checked_steps?: number[];
          recipe_version_id?: string;
          requested_servings?: number;
          timer_ends_at?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cooking_sessions_recipe_version_id_fkey";
            columns: ["recipe_version_id"];
            isOneToOne: false;
            referencedRelation: "recipe_versions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cooking_sessions_user_id_fkey";
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
      ingredient_ciqual_mappings: {
        Row: {
          confidence: number;
          created_at: string;
          food_code: string | null;
          ingredient_id: string;
          rationale_fr: string;
          reviewed_at: string | null;
          source_version_id: string;
          status: Database["public"]["Enums"]["ciqual_mapping_status"];
          updated_at: string;
        };
        Insert: {
          confidence: number;
          created_at?: string;
          food_code?: string | null;
          ingredient_id: string;
          rationale_fr: string;
          reviewed_at?: string | null;
          source_version_id: string;
          status: Database["public"]["Enums"]["ciqual_mapping_status"];
          updated_at?: string;
        };
        Update: {
          confidence?: number;
          created_at?: string;
          food_code?: string | null;
          ingredient_id?: string;
          rationale_fr?: string;
          reviewed_at?: string | null;
          source_version_id?: string;
          status?: Database["public"]["Enums"]["ciqual_mapping_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ingredient_ciqual_mappings_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ingredient_ciqual_mappings_source_version_id_food_code_fkey";
            columns: ["source_version_id", "food_code"];
            isOneToOne: false;
            referencedRelation: "ciqual_foods";
            referencedColumns: ["source_version_id", "code"];
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
          {
            foreignKeyName: "ingredient_corrections_requested_by_fkey";
            columns: ["requested_by"];
            isOneToOne: false;
            referencedRelation: "admin_user_directory";
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
      ingredient_unit_conversions: {
        Row: {
          confidence: number;
          created_at: string;
          density_g_per_ml: number | null;
          grams_per_unit: number | null;
          ingredient_id: string;
          reviewed_at: string | null;
          source_reference: string;
          unit: string;
          updated_at: string;
        };
        Insert: {
          confidence: number;
          created_at?: string;
          density_g_per_ml?: number | null;
          grams_per_unit?: number | null;
          ingredient_id: string;
          reviewed_at?: string | null;
          source_reference: string;
          unit: string;
          updated_at?: string;
        };
        Update: {
          confidence?: number;
          created_at?: string;
          density_g_per_ml?: number | null;
          grams_per_unit?: number | null;
          ingredient_id?: string;
          reviewed_at?: string | null;
          source_reference?: string;
          unit?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ingredient_unit_conversions_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
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
      learned_preferences: {
        Row: {
          corrected_at: string | null;
          corrected_score: number | null;
          score: number;
          signal_count: number;
          subject_code: string;
          subject_kind: Database["public"]["Enums"]["learned_preference_subject_kind"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          corrected_at?: string | null;
          corrected_score?: number | null;
          score?: number;
          signal_count?: number;
          subject_code: string;
          subject_kind: Database["public"]["Enums"]["learned_preference_subject_kind"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          corrected_at?: string | null;
          corrected_score?: number | null;
          score?: number;
          signal_count?: number;
          subject_code?: string;
          subject_kind?: Database["public"]["Enums"]["learned_preference_subject_kind"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learned_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
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
          revision: number;
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
          revision?: number;
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
          revision?: number;
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
      nutrition_source_versions: {
        Row: {
          attribution: string;
          documentation_url: string;
          doi: string;
          id: string;
          imported_at: string;
          is_current: boolean;
          license_name: string;
          published_on: string;
          source_name: string;
          source_sha256: string;
          source_url: string;
        };
        Insert: {
          attribution: string;
          documentation_url: string;
          doi: string;
          id: string;
          imported_at?: string;
          is_current?: boolean;
          license_name: string;
          published_on: string;
          source_name: string;
          source_sha256: string;
          source_url: string;
        };
        Update: {
          attribution?: string;
          documentation_url?: string;
          doi?: string;
          id?: string;
          imported_at?: string;
          is_current?: boolean;
          license_name?: string;
          published_on?: string;
          source_name?: string;
          source_sha256?: string;
          source_url?: string;
        };
        Relationships: [];
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
      planned_meal_mutations: {
        Row: {
          created_at: string;
          id: string;
          idempotency_key: string;
          kind: Database["public"]["Enums"]["planned_meal_mutation_kind"];
          meal_plan_id: string;
          planned_meal_id: string | null;
          resulting_plan_revision: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          idempotency_key: string;
          kind: Database["public"]["Enums"]["planned_meal_mutation_kind"];
          meal_plan_id: string;
          planned_meal_id?: string | null;
          resulting_plan_revision: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          idempotency_key?: string;
          kind?: Database["public"]["Enums"]["planned_meal_mutation_kind"];
          meal_plan_id?: string;
          planned_meal_id?: string | null;
          resulting_plan_revision?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "planned_meal_mutations_meal_plan_id_fkey";
            columns: ["meal_plan_id"];
            isOneToOne: false;
            referencedRelation: "meal_plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "planned_meal_mutations_planned_meal_id_fkey";
            columns: ["planned_meal_id"];
            isOneToOne: false;
            referencedRelation: "planned_meals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "planned_meal_mutations_user_id_fkey";
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
          revision: number;
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
          revision?: number;
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
          revision?: number;
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
      preference_learning_events: {
        Row: {
          created_at: string;
          dislike_reason: Database["public"]["Enums"]["dislike_reason"] | null;
          id: string;
          idempotency_key: string;
          interaction_kind: Database["public"]["Enums"]["preference_interaction_kind"];
          occurred_at: string;
          processed_at: string | null;
          recipe_id: string | null;
          reverted_at: string | null;
          status: Database["public"]["Enums"]["preference_learning_status"];
          subject_code: string;
          subject_kind: Database["public"]["Enums"]["learned_preference_subject_kind"];
          user_id: string;
          weight: number;
        };
        Insert: {
          created_at?: string;
          dislike_reason?: Database["public"]["Enums"]["dislike_reason"] | null;
          id?: string;
          idempotency_key: string;
          interaction_kind: Database["public"]["Enums"]["preference_interaction_kind"];
          occurred_at?: string;
          processed_at?: string | null;
          recipe_id?: string | null;
          reverted_at?: string | null;
          status?: Database["public"]["Enums"]["preference_learning_status"];
          subject_code: string;
          subject_kind: Database["public"]["Enums"]["learned_preference_subject_kind"];
          user_id: string;
          weight: number;
        };
        Update: {
          created_at?: string;
          dislike_reason?: Database["public"]["Enums"]["dislike_reason"] | null;
          id?: string;
          idempotency_key?: string;
          interaction_kind?: Database["public"]["Enums"]["preference_interaction_kind"];
          occurred_at?: string;
          processed_at?: string | null;
          recipe_id?: string | null;
          reverted_at?: string | null;
          status?: Database["public"]["Enums"]["preference_learning_status"];
          subject_code?: string;
          subject_kind?: Database["public"]["Enums"]["learned_preference_subject_kind"];
          user_id?: string;
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: "preference_learning_events_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "preference_learning_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
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
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "admin_user_directory";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_action_events: {
        Row: {
          action: Database["public"]["Enums"]["recipe_action_kind"];
          created_at: string;
          expires_at: string;
          id: string;
          idempotency_key: string;
          reason_category: Database["public"]["Enums"]["dislike_reason"] | null;
          recipe_id: string;
          surface: string;
          user_id: string;
        };
        Insert: {
          action: Database["public"]["Enums"]["recipe_action_kind"];
          created_at?: string;
          expires_at?: string;
          id?: string;
          idempotency_key: string;
          reason_category?:
            | Database["public"]["Enums"]["dislike_reason"]
            | null;
          recipe_id: string;
          surface: string;
          user_id: string;
        };
        Update: {
          action?: Database["public"]["Enums"]["recipe_action_kind"];
          created_at?: string;
          expires_at?: string;
          id?: string;
          idempotency_key?: string;
          reason_category?:
            | Database["public"]["Enums"]["dislike_reason"]
            | null;
          recipe_id?: string;
          surface?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_action_events_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_action_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
      recipe_equipment_requirements: {
        Row: {
          equipment_id: string;
          notes: string | null;
          optional: boolean;
          recipe_version_id: string;
        };
        Insert: {
          equipment_id: string;
          notes?: string | null;
          optional?: boolean;
          recipe_version_id: string;
        };
        Update: {
          equipment_id?: string;
          notes?: string | null;
          optional?: boolean;
          recipe_version_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_equipment_requirements_equipment_id_fkey";
            columns: ["equipment_id"];
            isOneToOne: false;
            referencedRelation: "equipment";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_equipment_requirements_recipe_version_id_fkey";
            columns: ["recipe_version_id"];
            isOneToOne: false;
            referencedRelation: "recipe_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_images: {
        Row: {
          alt_text: string | null;
          byte_size: number | null;
          checksum_sha256: string | null;
          content_type: string | null;
          created_at: string;
          failure_code: string | null;
          generated_at: string | null;
          generation_key: string | null;
          height: number | null;
          id: string;
          illustrative: boolean;
          is_primary: boolean;
          model: string | null;
          prompt_version: string | null;
          provider: string | null;
          recipe_id: string;
          recipe_version_id: string;
          status: Database["public"]["Enums"]["recipe_image_status"];
          storage_bucket: string;
          storage_path: string | null;
          updated_at: string;
          width: number | null;
        };
        Insert: {
          alt_text?: string | null;
          byte_size?: number | null;
          checksum_sha256?: string | null;
          content_type?: string | null;
          created_at?: string;
          failure_code?: string | null;
          generated_at?: string | null;
          generation_key?: string | null;
          height?: number | null;
          id?: string;
          illustrative?: boolean;
          is_primary?: boolean;
          model?: string | null;
          prompt_version?: string | null;
          provider?: string | null;
          recipe_id: string;
          recipe_version_id: string;
          status?: Database["public"]["Enums"]["recipe_image_status"];
          storage_bucket?: string;
          storage_path?: string | null;
          updated_at?: string;
          width?: number | null;
        };
        Update: {
          alt_text?: string | null;
          byte_size?: number | null;
          checksum_sha256?: string | null;
          content_type?: string | null;
          created_at?: string;
          failure_code?: string | null;
          generated_at?: string | null;
          generation_key?: string | null;
          height?: number | null;
          id?: string;
          illustrative?: boolean;
          is_primary?: boolean;
          model?: string | null;
          prompt_version?: string | null;
          provider?: string | null;
          recipe_id?: string;
          recipe_version_id?: string;
          status?: Database["public"]["Enums"]["recipe_image_status"];
          storage_bucket?: string;
          storage_path?: string | null;
          updated_at?: string;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_images_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
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
          reason_detail: string | null;
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
          reason_detail?: string | null;
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
          reason_detail?: string | null;
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
      recipe_substitutions: {
        Row: {
          ingredient_id: string;
          note: string | null;
          recipe_version_id: string;
          substitute_ingredient_id: string;
        };
        Insert: {
          ingredient_id: string;
          note?: string | null;
          recipe_version_id: string;
          substitute_ingredient_id: string;
        };
        Update: {
          ingredient_id?: string;
          note?: string | null;
          recipe_version_id?: string;
          substitute_ingredient_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_substitutions_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_substitutions_recipe_version_id_fkey";
            columns: ["recipe_version_id"];
            isOneToOne: false;
            referencedRelation: "recipe_versions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_substitutions_substitute_ingredient_id_fkey";
            columns: ["substitute_ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
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
          preserve_budget: boolean;
          preserve_calories: boolean;
          preserve_duration: boolean;
          preserve_protein: boolean;
          quota_counted: boolean;
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
          preserve_budget?: boolean;
          preserve_calories?: boolean;
          preserve_duration?: boolean;
          preserve_protein?: boolean;
          quota_counted?: boolean;
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
          preserve_budget?: boolean;
          preserve_calories?: boolean;
          preserve_duration?: boolean;
          preserve_protein?: boolean;
          quota_counted?: boolean;
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
          image_illustrative: boolean;
          origin: Database["public"]["Enums"]["recipe_origin"];
          preparation_minutes: number;
          prompt_version: string | null;
          publication_status: Database["public"]["Enums"]["recipe_publication_status"];
          published_at: string | null;
          recipe_id: string;
          reheating_instructions: string | null;
          resting_minutes: number;
          servings: number;
          storage_instructions: string | null;
          tips: string[];
          title: string;
          updated_at: string;
          validated_at: string | null;
          validation_notes: string | null;
          validation_status: Database["public"]["Enums"]["recipe_validation_status"];
          variants: string[];
          version_number: number;
          visual_alt_text: string | null;
          visual_prompt: string | null;
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
          image_illustrative?: boolean;
          origin: Database["public"]["Enums"]["recipe_origin"];
          preparation_minutes: number;
          prompt_version?: string | null;
          publication_status?: Database["public"]["Enums"]["recipe_publication_status"];
          published_at?: string | null;
          recipe_id: string;
          reheating_instructions?: string | null;
          resting_minutes?: number;
          servings: number;
          storage_instructions?: string | null;
          tips?: string[];
          title: string;
          updated_at?: string;
          validated_at?: string | null;
          validation_notes?: string | null;
          validation_status?: Database["public"]["Enums"]["recipe_validation_status"];
          variants?: string[];
          version_number: number;
          visual_alt_text?: string | null;
          visual_prompt?: string | null;
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
          image_illustrative?: boolean;
          origin?: Database["public"]["Enums"]["recipe_origin"];
          preparation_minutes?: number;
          prompt_version?: string | null;
          publication_status?: Database["public"]["Enums"]["recipe_publication_status"];
          published_at?: string | null;
          recipe_id?: string;
          reheating_instructions?: string | null;
          resting_minutes?: number;
          servings?: number;
          storage_instructions?: string | null;
          tips?: string[];
          title?: string;
          updated_at?: string;
          validated_at?: string | null;
          validation_notes?: string | null;
          validation_status?: Database["public"]["Enums"]["recipe_validation_status"];
          variants?: string[];
          version_number?: number;
          visual_alt_text?: string | null;
          visual_prompt?: string | null;
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
        Relationships: [
          {
            foreignKeyName: "recipes_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_user_directory";
            referencedColumns: ["id"];
          },
        ];
      };
      shopping_list_item_sources: {
        Row: {
          recipe_version_id: string;
          shopping_list_item_id: string;
        };
        Insert: {
          recipe_version_id: string;
          shopping_list_item_id: string;
        };
        Update: {
          recipe_version_id?: string;
          shopping_list_item_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_list_item_sources_recipe_version_id_fkey";
            columns: ["recipe_version_id"];
            isOneToOne: false;
            referencedRelation: "recipe_versions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_list_item_sources_shopping_list_item_id_fkey";
            columns: ["shopping_list_item_id"];
            isOneToOne: false;
            referencedRelation: "shopping_list_items";
            referencedColumns: ["id"];
          },
        ];
      };
      shopping_list_items: {
        Row: {
          aisle: string | null;
          checked_at: string | null;
          created_at: string;
          id: string;
          ingredient_id: string | null;
          is_available: boolean;
          manual_label: string | null;
          quantity: number | null;
          revision: number;
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
          is_available?: boolean;
          manual_label?: string | null;
          quantity?: number | null;
          revision?: number;
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
          is_available?: boolean;
          manual_label?: string | null;
          quantity?: number | null;
          revision?: number;
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
      shopping_list_mutations: {
        Row: {
          action: string;
          created_at: string;
          id: string;
          idempotency_key: string;
          shopping_list_id: string;
          user_id: string;
        };
        Insert: {
          action: string;
          created_at?: string;
          id?: string;
          idempotency_key: string;
          shopping_list_id: string;
          user_id: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          id?: string;
          idempotency_key?: string;
          shopping_list_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_list_mutations_shopping_list_id_fkey";
            columns: ["shopping_list_id"];
            isOneToOne: false;
            referencedRelation: "shopping_lists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_list_mutations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
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
          plan_revision: number | null;
          revision: number;
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
          plan_revision?: number | null;
          revision?: number;
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
          plan_revision?: number | null;
          revision?: number;
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
          {
            foreignKeyName: "user_legal_consents_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "admin_user_directory";
            referencedColumns: ["id"];
          },
        ];
      };
      user_recipe_eligibility: {
        Row: {
          checked_at: string;
          eligible: boolean;
          reason: string | null;
          recipe_id: string;
          user_id: string;
        };
        Insert: {
          checked_at?: string;
          eligible: boolean;
          reason?: string | null;
          recipe_id: string;
          user_id: string;
        };
        Update: {
          checked_at?: string;
          eligible?: boolean;
          reason?: string | null;
          recipe_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_recipe_eligibility_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_recipe_eligibility_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
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
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey";
            columns: ["granted_by"];
            isOneToOne: false;
            referencedRelation: "admin_user_directory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "admin_user_directory";
            referencedColumns: ["id"];
          },
        ];
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
      admin_ai_usage_daily: {
        Row: {
          estimated_cost_usd: number | null;
          limit_count: number | null;
          quota_key: string | null;
          updated_at: string | null;
          usage_date: string | null;
          usage_percent: number | null;
          used_count: number | null;
        };
        Insert: {
          estimated_cost_usd?: number | null;
          limit_count?: number | null;
          quota_key?: string | null;
          updated_at?: string | null;
          usage_date?: string | null;
          usage_percent?: never;
          used_count?: number | null;
        };
        Update: {
          estimated_cost_usd?: number | null;
          limit_count?: number | null;
          quota_key?: string | null;
          updated_at?: string | null;
          usage_date?: string | null;
          usage_percent?: never;
          used_count?: number | null;
        };
        Relationships: [];
      };
      admin_user_directory: {
        Row: {
          created_at: string | null;
          deletion_request_id: string | null;
          deletion_status:
            | Database["public"]["Enums"]["account_deletion_status"]
            | null;
          email: string | null;
          first_name: string | null;
          id: string | null;
          last_name: string | null;
          last_sign_in_at: string | null;
          status: Database["public"]["Enums"]["account_state_kind"] | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      admin_create_recipe_revision: {
        Args: {
          p_description: string;
          p_idempotency_key: string;
          p_recipe_version_id: string;
          p_title: string;
        };
        Returns: string;
      };
      admin_process_deletion_request: {
        Args: {
          p_confirmation: string;
          p_idempotency_key: string;
          p_request_id: string;
          p_status: Database["public"]["Enums"]["account_deletion_status"];
        };
        Returns: boolean;
      };
      admin_resolve_report: {
        Args: {
          p_confirmation: string;
          p_idempotency_key: string;
          p_report_id: string;
          p_status: Database["public"]["Enums"]["report_status"];
        };
        Returns: boolean;
      };
      admin_review_recipe_revision: {
        Args: {
          p_approve: boolean;
          p_idempotency_key: string;
          p_notes: string;
          p_recipe_version_id: string;
        };
        Returns: boolean;
      };
      admin_set_account_status: {
        Args: {
          p_confirmation: string;
          p_idempotency_key: string;
          p_reason: string;
          p_status: Database["public"]["Enums"]["account_state_kind"];
          p_user_id: string;
        };
        Returns: boolean;
      };
      admin_set_blocked_food_rule: {
        Args: {
          p_active: boolean;
          p_confirmation: string;
          p_idempotency_key: string;
          p_ingredient_id: string;
          p_paired_ingredient_id: string;
          p_reason: string;
          p_rule_id: string;
        };
        Returns: string;
      };
      admin_set_recipe_publication: {
        Args: {
          p_action: string;
          p_confirmation: string;
          p_idempotency_key: string;
          p_recipe_version_id: string;
        };
        Returns: boolean;
      };
      apply_planned_meal_mutation: {
        Args: {
          p_expected_plan_revision: number;
          p_idempotency_key: string;
          p_is_locked?: boolean;
          p_kind: Database["public"]["Enums"]["planned_meal_mutation_kind"];
          p_meal_date?: string;
          p_meal_plan_id: string;
          p_meal_type?: Database["public"]["Enums"]["meal_type"];
          p_planned_meal_id?: string;
          p_recipe_version_id?: string;
          p_servings?: number;
        };
        Returns: Json;
      };
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
      complete_plan_regeneration: {
        Args: {
          p_expected_plan_revision: number;
          p_meal_plan_id: string;
          p_recipe_ids: string[];
          p_user_id: string;
        };
        Returns: number;
      };
      complete_recipe_swap: {
        Args: {
          p_from_recipe_version_id: string;
          p_idempotency_key: string;
          p_planned_meal_id: string;
          p_preserve_budget: boolean;
          p_preserve_calories: boolean;
          p_preserve_duration: boolean;
          p_preserve_protein: boolean;
          p_request_summary: string;
          p_to_recipe_version_id: string;
        };
        Returns: Json;
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
      copy_meal_plan_week: {
        Args: {
          p_idempotency_key: string;
          p_source_week_start: string;
          p_target_week_start: string;
        };
        Returns: Json;
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
      correct_learned_preference: {
        Args: {
          p_corrected_score: number;
          p_subject_code: string;
          p_subject_kind: Database["public"]["Enums"]["learned_preference_subject_kind"];
        };
        Returns: boolean;
      };
      export_my_account: { Args: never; Returns: Json };
      is_ai_cost_circuit_open: {
        Args: { p_daily_cost_limit_usd: number };
        Returns: boolean;
      };
      mutate_shopping_list: {
        Args: {
          p_action: string;
          p_aisle?: string;
          p_available?: boolean;
          p_checked?: boolean;
          p_confirmation?: string;
          p_idempotency_key: string;
          p_item_id?: string;
          p_manual_label?: string;
          p_quantity?: number;
          p_shopping_list_id: string;
          p_unit?: string;
        };
        Returns: Json;
      };
      normalize_search_term: { Args: { value: string }; Returns: string };
      record_ai_usage: {
        Args: {
          p_estimated_cost_usd: number;
          p_event_key: string;
          p_image_count: number;
          p_input_tokens: number;
          p_job_id: string;
          p_kind: string;
          p_model: string;
          p_neurons: number;
          p_output_tokens: number;
          p_provider: string;
          p_user_id: string;
        };
        Returns: boolean;
      };
      record_preference_learning_signal: {
        Args: {
          p_dislike_reason: Database["public"]["Enums"]["dislike_reason"];
          p_idempotency_key: string;
          p_interaction_kind: Database["public"]["Enums"]["preference_interaction_kind"];
          p_recipe_id: string;
          p_subject_code: string;
          p_subject_kind: Database["public"]["Enums"]["learned_preference_subject_kind"];
          p_weight: number;
        };
        Returns: string;
      };
      refresh_user_recipe_eligibility: {
        Args: { p_user_id?: string };
        Returns: number;
      };
      replace_generated_shopping_items: {
        Args: {
          p_idempotency_key: string;
          p_items: Json;
          p_meal_plan_id: string;
          p_plan_revision: number;
        };
        Returns: Json;
      };
      request_account_deletion: {
        Args: { p_confirmation: string; p_idempotency_key: string };
        Returns: string;
      };
      reserve_ai_generation_job: {
        Args: {
          p_global_daily_limit: number;
          p_idempotency_key: string;
          p_prompt_version: string;
          p_recipe_count: number;
          p_request_payload: Json;
          p_user_daily_limit: number;
          p_user_id: string;
        };
        Returns: string;
      };
      revert_preference_learning_signal: {
        Args: { p_event_id: string };
        Returns: boolean;
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
      store_validated_ai_recipe: {
        Args: {
          p_canonical_slug: string;
          p_deduplication_hash: string;
          p_job_id: string;
          p_model: string;
          p_nutrition: Json;
          p_position: number;
          p_prompt_version: string;
          p_provider: string;
          p_recipe: Json;
          p_user_id: string;
        };
        Returns: string;
      };
    };
    Enums: {
      account_deletion_status:
        | "requested"
        | "processing"
        | "completed"
        | "failed";
      account_state_kind: "active" | "suspended";
      ai_job_kind: "meal_plan" | "recipe" | "recipe_swap" | "recipe_image";
      ai_job_status:
        | "queued"
        | "running"
        | "succeeded"
        | "failed"
        | "cancelled";
      app_role: "user" | "admin";
      budget_level: "low" | "moderate" | "flexible";
      ciqual_mapping_status: "exact" | "approximate" | "unmatched";
      ciqual_value_status:
        | "exact"
        | "less_than"
        | "trace"
        | "missing"
        | "unparsed";
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
      learned_preference_subject_kind:
        | "ingredient"
        | "cuisine"
        | "duration"
        | "budget"
        | "dish_type";
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
      planned_meal_mutation_kind: "add" | "update" | "remove" | "regenerate";
      preference_interaction_kind:
        | "like"
        | "favorite"
        | "cooked"
        | "dislike"
        | "swap"
        | "ignored";
      preference_learning_status: "pending" | "processed" | "failed";
      preference_signal: "liked" | "disliked";
      preference_source: "explicit" | "interaction" | "inferred";
      recipe_action_kind:
        | "like"
        | "dislike"
        | "clear_reaction"
        | "favorite"
        | "unfavorite"
        | "cooked"
        | "shopping"
        | "report";
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
      account_state_kind: ["active", "suspended"],
      ai_job_kind: ["meal_plan", "recipe", "recipe_swap", "recipe_image"],
      ai_job_status: ["queued", "running", "succeeded", "failed", "cancelled"],
      app_role: ["user", "admin"],
      budget_level: ["low", "moderate", "flexible"],
      ciqual_mapping_status: ["exact", "approximate", "unmatched"],
      ciqual_value_status: [
        "exact",
        "less_than",
        "trace",
        "missing",
        "unparsed",
      ],
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
      learned_preference_subject_kind: [
        "ingredient",
        "cuisine",
        "duration",
        "budget",
        "dish_type",
      ],
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
      planned_meal_mutation_kind: ["add", "update", "remove", "regenerate"],
      preference_interaction_kind: [
        "like",
        "favorite",
        "cooked",
        "dislike",
        "swap",
        "ignored",
      ],
      preference_learning_status: ["pending", "processed", "failed"],
      preference_signal: ["liked", "disliked"],
      preference_source: ["explicit", "interaction", "inferred"],
      recipe_action_kind: [
        "like",
        "dislike",
        "clear_reaction",
        "favorite",
        "unfavorite",
        "cooked",
        "shopping",
        "report",
      ],
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
